// controllers/borrowController.js
const { clerkClient } = require("../../config/clerk");
const Borrow = require("../../model/borrow.model");
const Item = require("../../model/item.model");
const Status = require("../../model/status.model");
const Category = require("../../model/category.model");
const Type = require("../../model/type.model");
const Notification = require("../../model/Notification.model");
const nodemailer = require("nodemailer");
const logActivity = require("../../utils/activityLogger");
const mongoose = require("mongoose");

const createBorrow = async (req, res) => {
  try {
    const { totalPrice, totalTime, borrowers, itemId, startTime, endTime } =
      req.body;
    const borrowerId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Item ID format",
      });
    }

    if (
      !itemId ||
      !totalPrice ||
      !totalTime ||
      !borrowers ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (itemId, totalPrice, totalTime, borrowers, startTime, endTime) are required",
      });
    }

    const item = await Item.findById(itemId)
      .populate("statusId")
      .populate("typeId");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.typeId?.name !== "Borrow") {
      return res.status(400).json({
        success: false,
        message: "This item is not available for borrowing",
      });
    }

    if (
      item.statusId?.name !== "Available" &&
      item.statusId?.name !== "Approved"
    ) {
      return res.status(400).json({
        success: false,
        message: "This item is not available for borrowing",
      });
    }

    // Prevent borrower from borrowing their own item
    if (item.owner.toString() === borrowerId) {
      return res.status(400).json({
        success: false,
        message: "You cannot borrow your own item",
      });
    }

    const user = await clerkClient.users.getUser(borrowerId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Borrower not found in the system",
      });
    }

    const seller = await clerkClient.users.getUser(item.owner);
    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "SellerId is not exist in the system",
      });
    }

    const currentCoins = Number.parseInt(user.publicMetadata?.coin) || 0;
    const currentSellerCoins =
      Number.parseInt(seller.publicMetadata?.coin) || 0;

    // Verify sufficient coins
    if (currentCoins < totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Insufficient coins to borrow this item",
      });
    }

    // Find the "Borrowed" status
    const borrowedStatus = await Status.findOne({ name: "Borrowed" });
    if (!borrowedStatus) {
      return res.status(500).json({
        success: false,
        message: "Server error: Borrowed status configuration missing",
      });
    }

    // Deduct coins and update user's metadata
    const newCoinBalance = currentCoins - totalPrice;
    await clerkClient.users.updateUserMetadata(borrowerId, {
      publicMetadata: {
        coin: newCoinBalance,
      },
    });

    const newSellerCoinBalance = currentSellerCoins + totalPrice;
    await clerkClient.users.updateUserMetadata(item.owner, {
      publicMetadata: {
        coin: newSellerCoinBalance,
      },
    });

    const borrow = new Borrow({
      totalPrice,
      totalTime,
      borrowers,
      itemId,
      startTime,
      endTime,
    });
    await borrow.save();

    item.statusId = borrowedStatus._id;
    await item.save();
    try {
      const borrowerClerk = user;
      const ownerClerk = seller;

      const borrowerName =
        borrowerClerk?.username ||
        borrowerClerk?.firstName ||
        "Người dùng ẩn danh";
      const ownerName =
        ownerClerk?.username || ownerClerk?.firstName || "Người dùng ẩn danh";

      await logActivity(
        borrowerId, // userId: ID của người mượn
        "BORROW_REQUESTED", // actionType: Yêu cầu mượn đã được tạo
        `${borrowerName} đã yêu cầu mượn vật phẩm "${item.name}" từ ${ownerName} trong ${totalTime} giờ với giá ${totalPrice} coins.`, // description
        "Borrow", // entityType: Đối tượng bị ảnh hưởng là 'Borrow'
        borrow._id, // entityId: ID của bản ghi Borrow vừa tạo
        req, // Truyền đối tượng request để log IP và User-Agent
        {
          itemId: item._id,
          itemName: item.name,
          itemPrice: item.price,
          itemOwnerId: item.owner,
          borrowDurationHours: totalTime,
          borrowCost: totalPrice,
          borrowStartTime: startTime,
          borrowEndTime: endTime,
        } // Payload bổ sung
      );
      console.log(
        `Activity logged: Borrow request for "${item.name}" created by ${borrowerName}.`
      );
    } catch (logError) {
      console.error("Error logging BORROW_REQUESTED activity:", logError);
    }
    return res.status(201).json({
      status: 201,
      message: "Borrow created and item status updated.",
      borrow,
      updatedItem: item,
    });
  } catch (error) {
    console.error("Error creating borrow:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const getAllBorrowRecordByUserId = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const borrowRecords = await Borrow.find({ borrowers: userId })
      .populate({
        path: "itemId",
        populate: [
          { path: "statusId", select: "name" },
          { path: "typeId", select: "name" },
          { path: "categoryId", select: "name" },
        ],
      })
      .sort({ createdAt: -1 });

    // Check if records exist
    if (!borrowRecords || borrowRecords.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No borrow records found for this user",
        data: [],
      });
    }

    const formattedRecords = borrowRecords.map((record) => ({
      borrowId: record._id,
      item: record.itemId,
      totalPrice: record.totalPrice,
      totalTime: record.totalTime,
      startTime: record.startTime,
      endTime: record.endTime,
      status: record.status,
      borrowDate: record.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Borrow history retrieved successfully",
      data: formattedRecords,
    });
  } catch (error) {
    console.error("Error fetching borrow records:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const requestForReturnBorrow = async (req, res) => {
  try {
    const borrowerId = req.userId;
    const user = req.user;
    const { borrowId, message } = req.body;
    if (!borrowerId || !borrowId || !message) {
      return res.status(400).json({
        success: false,
        message: "Borrower ID, borrow ID, and message are required",
      });
    }

    const borrowRecord = await Borrow.findOne({
      _id: borrowId,
      borrowers: borrowerId,
    });
    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found or not borrowed by you",
      });
    }

    if (borrowRecord.status === "returned") {
      return res
        .status(400)
        .json({ success: false, message: "This item has been returned!" });
    }

    const item = await Item.findOne({ _id: borrowRecord.itemId });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Fetch owner information
    const ownerInfo = await clerkClient.users.getUser(item.owner);
    let ownerEmail = "";
    let ownerPhone = "";
    if (ownerInfo) {
      const owner = {
        name: `${ownerInfo.firstName || ""} ${ownerInfo.lastName || ""}`.trim(),
        emailAddresses:
          ownerInfo.emailAddresses.map((email) => email.emailAddress) || [],
        phoneNumbers:
          ownerInfo.phoneNumbers.map((phone) => phone.phoneNumber) || [],
      };
      ownerEmail = owner.emailAddresses[0] || "";
      ownerPhone = owner.phoneNumbers[0] || "";
    }

    // Create notification
    const notification = new Notification({
      recipientId: item.owner,
      type: "borrow_confirm",
      message: `User ${user.firstName} ${user.lastName} has requested to return item "${item.name}" (Borrow ID: ${borrowId}). Message: ${message}`,
      link: `/history`,
    });
    await notification.save();

    // Email configuration
    if (ownerEmail.length > 0) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ownerEmail,
        subject: "OLD MARKET - RETURN REQUEST FOR BORROWED ITEM",
        text: `${user.firstName} ${user.lastName} has requested to return item "${item.name}" (Borrow ID: ${borrowId}). Message: ${message}. Check your dashboard: ${notification.link}`,
      };
      await transporter.sendMail(mailOptions);
    }
    try {
      const borrowerName = user.firstName + " " + user.lastName; // Lấy từ req.user
      await logActivity(
        borrowerId, // userId: ID của người yêu cầu trả
        "BORROW_RETURN_REQUESTED", // actionType: Loại hành động
        `${borrowerName} đã yêu cầu trả lại vật phẩm "${item.name}" (ID mượn: ${borrowId}) cho ${ownerNameForNotification}.`, // description
        "Borrow", // entityType: Đối tượng bị ảnh hưởng là 'Borrow'
        borrowId, // entityId: ID của bản ghi Borrow
        req, // Truyền đối tượng request để log IP và User-Agent
        {
          itemId: item._id,
          itemName: item.name,
          borrowerId: borrowerId,
          itemOwnerId: item.owner,
          requestMessage: message,
        } // Payload bổ sung
      );
      console.log(
        `Activity logged: Return request for "${item.name}" by ${borrowerName}.`
      );
    } catch (logError) {
      console.error(
        "Error logging BORROW_RETURN_REQUESTED activity:",
        logError
      );
    }
    return res.status(200).json({
      success: true,
      message: "Return request submitted and notifications sent",
      data: notification,
    });
  } catch (error) {
    console.error("Error requesting return:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const confirmReturnBorrow = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { borrowId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(borrowId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Borrow ID format",
      });
    }

    if (!borrowId) {
      return res.status(400).json({
        success: false,
        message: "Borrow ID is required",
      });
    }

    // Find the borrow record with populated item
    const borrow = await Borrow.findById(borrowId).populate("itemId");

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found",
      });
    }

    // Verify the owner is authorized
    if (borrow.itemId.owner.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to confirm this return",
      });
    }

    // Check if the item is already returned
    if (borrow.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "This item has already been returned",
      });
    }

    // Set actual return time
    const actualTime = new Date();
    const isLate = actualTime > borrow.endTime;
    const newStatus = isLate ? "late" : "returned";

    // Calculate late fee if applicable
    let lateFee = 0;
    if (isLate && borrow.itemId.ratePrice !== "no") {
      const timeDiffMs = actualTime - borrow.endTime; // Difference in milliseconds
      if (borrow.itemId.ratePrice === "hour") {
        const hoursLate = Math.ceil(timeDiffMs / (1000 * 60 * 60)); // Convert to hours
        lateFee = borrow.itemId.price * hoursLate;
      } else if (borrow.itemId.ratePrice === "day") {
        const daysLate = Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24)); // Convert to days
        lateFee = borrow.itemId.price * daysLate;
      }
    }

    // Update borrow record
    borrow.actualTime = actualTime;
    borrow.status = newStatus;
    await borrow.save();

    // Update item status to "Available"
    const availableStatus = await Status.findOne({ name: "Available" });
    if (!availableStatus) {
      return res.status(500).json({
        success: false,
        message: "Server error: Available status configuration missing",
      });
    }
    borrow.itemId.statusId = availableStatus._id;
    await borrow.itemId.save();

    // Notify borrower and handle late fee
    const borrower = await clerkClient.users.getUser(borrow.borrowers);
    if (borrower) {
      const borrowerEmail = borrower.emailAddresses[0]?.emailAddress || "";
      if (borrowerEmail) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: borrowerEmail,
          subject: "OLD MARKET - RETURN CONFIRMED",
          text: `Your return request for item "${
            borrow.itemId.name
          }" has been confirmed by the owner. Status: ${newStatus}. ${
            isLate ? `Late fee of ${lateFee} coins applied.` : ""
          }`,
        };
        await transporter.sendMail(mailOptions);
      }

      // Create notification
      const notification = new Notification({
        recipientId: borrow.borrowers,
        type: "system",
        message: `Your return request for item "${
          borrow.itemId.name
        }" has been confirmed. Status: ${newStatus}. ${
          isLate ? `Late fee of ${lateFee} coins applied.` : ""
        }`,
        link: `/history`,
      });
      await notification.save();

      // Deduct late fee from borrower if applicable
      if (isLate && lateFee > 0) {
        const currentBorrowerCoins =
          Number.parseInt(borrower.publicMetadata?.coin) || 0;
        const newBorrowerCoins = currentBorrowerCoins - lateFee;
        if (newBorrowerCoins >= 0) {
          await clerkClient.users.updateUserMetadata(borrow.borrowers, {
            publicMetadata: {
              coin: newBorrowerCoins,
            },
          });
        } else {
          // Handle insufficient funds (e.g., notify admin or borrower)
          await clerkClient.users.updateUserMetadata(borrow.borrowers, {
            publicMetadata: {
              coin: 0,
            },
          });
          console.warn(
            `Borrower ${borrow.borrowers} has insufficient coins to cover late fee of ${lateFee}`
          );
        }
      }
    }
    try {
      const ownerClerk = await clerkClient.users.getUser(ownerId);
      const borrowerClerk = await clerkClient.users.getUser(borrow.borrowers);

      const ownerName =
        ownerClerk?.username || ownerClerk?.firstName || "Người dùng ẩn danh";
      const borrowerName =
        borrowerClerk?.username ||
        borrowerClerk?.firstName ||
        "Người dùng ẩn danh";

      await logActivity(
        ownerId, // userId: ID của người xác nhận (chủ sở hữu)
        `BORROW_${newStatus.toUpperCase()}`, // actionType: BORROW_RETURNED hoặc BORROW_LATE
        `${ownerName} đã xác nhận trả lại vật phẩm "${
          borrow.itemId.name
        }" từ ${borrowerName}. Trạng thái: ${newStatus}.${
          isLate ? ` Phí phạt: ${lateFee} coins.` : ""
        }`, // description
        "Borrow", // entityType: Đối tượng bị ảnh hưởng là 'Borrow'
        borrow._id, // entityId: ID của bản ghi Borrow
        req, // Truyền đối tượng request để log IP và User-Agent
        {
          itemId: borrow.itemId._id,
          itemName: borrow.itemId.name,
          borrowerId: borrow.borrowers,
          itemOwnerId: borrow.itemId.owner,
          actualReturnTime: actualTime,
          statusAfterConfirmation: newStatus,
          isLate: isLate,
          lateFee: lateFee,
        } // Payload bổ sung
      );
      console.log(
        `Activity logged: Return for "${borrow.itemId.name}" confirmed by ${ownerName}.`
      );
    } catch (logError) {
      console.error("Error logging BORROW_CONFIRM_RETURN activity:", logError);
    }
    return res.status(200).json({
      success: true,
      message: `Return confirmed. Status: ${newStatus}${
        isLate ? ` with late fee of ${lateFee} coins applied` : ""
      }`,
      data: {
        borrowId: borrow._id,
        actualTime,
        status: newStatus,
        lateFee: isLate ? lateFee : 0,
      },
    });
  } catch (error) {
    console.error("Error confirming return:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const extendBorrow = async (req, res) => {
  try {
    const borrowerId = req.userId;
    const { borrowId, newEndTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(borrowId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Borrow ID format",
      });
    }

    if (!borrowId || !newEndTime) {
      return res.status(400).json({
        success: false,
        message: "Borrow ID and new end time are required",
      });
    }

    // Validate newEndTime is in the future
    const newEndTimeDate = new Date(newEndTime);
    if (isNaN(newEndTimeDate.getTime()) || newEndTimeDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "New end time must be a future date",
      });
    }

    const borrow = await Borrow.findById(borrowId).populate("itemId");

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found",
      });
    }

    if (newEndTimeDate <= borrow.endTime) {
      return res.status(400).json({
        success: false,
        message: "New end time must be after the current end time",
      });
    }

    if (borrow.borrowers !== borrowerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to extend this borrow",
      });
    }

    // Prevent extension if already returned or late
    if (
      borrow.status === "returned" ||
      borrow.status === "late" ||
      borrow.status === "not_returned"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot extend a returned, late, or not returned borrow",
      });
    }

    // Calculate extension cost
    const currentEndTime = borrow.endTime;
    const timeDiffMs = newEndTimeDate - currentEndTime; // Difference in milliseconds
    let extensionCost = 0;
    if (borrow.itemId.ratePrice === "hour") {
      const hoursExtended = Math.ceil(timeDiffMs / (1000 * 60 * 60)); // Convert to hours
      extensionCost = borrow.itemId.price * hoursExtended;
    } else if (borrow.itemId.ratePrice === "day") {
      const daysExtended = Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24)); // Convert to days
      extensionCost = borrow.itemId.price * daysExtended;
    } else if (borrow.itemId.ratePrice === "no") {
      return res.status(400).json({
        success: false,
        message: "Extension not allowed for items with no rate price",
      });
    }

    // Verify borrower has sufficient coins
    const borrower = await clerkClient.users.getUser(borrowerId);
    if (!borrower) {
      return res.status(400).json({
        success: false,
        message: "Borrower not found in the system",
      });
    }

    const currentCoins = Number.parseInt(borrower.publicMetadata?.coin) || 0;
    if (currentCoins < extensionCost) {
      return res.status(400).json({
        success: false,
        message: "Insufficient coins to extend the borrow",
      });
    }

    // Deduct extension cost from borrower
    const newCoinBalance = currentCoins - extensionCost;
    await clerkClient.users.updateUserMetadata(borrowerId, {
      publicMetadata: {
        coin: newCoinBalance,
      },
    });

    // Fetch seller information and add coint
    const seller = await clerkClient.users.getUser(
      borrow.itemId.owner.toString()
    );
    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "Seller not found in the system",
      });
    }
    const currentSellerCoins =
      Number.parseInt(seller.publicMetadata?.coin) || 0;
    const newSellerCoinBalance = currentSellerCoins + extensionCost;
    await clerkClient.users.updateUserMetadata(borrow.itemId.owner.toString(), {
      publicMetadata: {
        coin: newSellerCoinBalance,
      },
    });

    // Update borrow end time
    borrow.endTime = newEndTimeDate;
    await borrow.save();

    // Notify owner of extension request
    const owner = await clerkClient.users.getUser(
      borrow.itemId.owner.toString()
    );
    if (owner) {
      const ownerEmail = owner.emailAddresses[0]?.emailAddress || "";
      if (ownerEmail) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: ownerEmail,
          subject: "OLD MARKET - BORROW EXTENSION REQUEST",
          text: `Borrower ${borrower.firstName} ${
            borrower.lastName
          } has extended the borrow for item "${
            borrow.itemId.name
          }" until ${formatReadableDate(
            newEndTimeDate
          )}. Extension cost: ${extensionCost} coins.`,
        };
        await transporter.sendMail(mailOptions);
      }

      // Create notification for owner
      const notification = new Notification({
        recipientId: borrow.itemId.owner,
        type: "system",
        message: `Borrower ${borrower.firstName} ${
          borrower.lastName
        } has extended the borrow for item "${
          borrow.itemId.name
        }" until ${formatReadableDate(
          newEndTimeDate
        )}. Cost: ${extensionCost} coins.`,
        link: `/history`,
      });
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      message: `Borrow extended until ${formatReadableDate(
        newEndTimeDate
      )}. Extension cost: ${extensionCost} coins`,
      data: {
        borrowId: borrow._id,
        newEndTime: newEndTimeDate,
        extensionCost,
        remainingCoins: newCoinBalance,
      },
    });
  } catch (error) {
    console.error("Error extending borrow:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const formatReadableDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

module.exports = {
  createBorrow,
  getAllBorrowRecordByUserId,
  requestForReturnBorrow,
  confirmReturnBorrow,
  extendBorrow,
};
