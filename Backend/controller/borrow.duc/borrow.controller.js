// controllers/borrowController.js
const { clerkClient } = require("../../config/clerk");
const Borrow = require("../../model/borrow.model");
const Item = require("../../model/item.model");
const Status = require("../../model/status.model");
const Category = require("../../model/category.model");
const Type = require("../../model/type.model");
const Notification = require("../../model/Notification.model");
const nodemailer = require('nodemailer');

const createBorrow = async (req, res) => {
  try {
    const { totalPrice, totalTime, borrowers, itemId, startTime, endTime } = req.body;
    const borrowerId = req.userId;

    if (!itemId || !totalPrice || !totalTime || !borrowers || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All fields (itemId, totalPrice, totalTime, borrowers, startTime, endTime) are required",
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

    if (item.statusId?.name !== "Available" && item.statusId?.name !== "Approved") {
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

    const currentCoins = Number.parseInt(user.publicMetadata?.coin) || 0;

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
      return res.status(404).json({
        success: false,
        message: "No borrow records found for this user",
      });
    }

    const formattedRecords = borrowRecords.map(record => ({
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
    console.log("User info", user)
    const { itemId, message } = req.body;
    console.log(borrowerId)
    console.log(itemId)
    console.log(message)
    if (!borrowerId || !itemId || !message) {
      return res.status(400).json({ success: false, message: 'Borrower ID, item ID, and message are required' });
    }

    const item = await Item.findOne({ _id: itemId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found or not borrowed by you' });
    }

    // Fetch owner information
    const ownerInfo = await clerkClient.users.getUser(item.owner);
    let ownerEmail = '';
    let ownerPhone = '';
    if (ownerInfo) {
      const owner = {
        name: `${ownerInfo.firstName || ''} ${ownerInfo.lastName || ''}`.trim(),
        emailAddresses: ownerInfo.emailAddresses.map(email => email.emailAddress) || [],
        phoneNumbers: ownerInfo.phoneNumbers.map(phone => phone.phoneNumber) || [],
      };
      ownerEmail = owner.emailAddresses[0] || ''; 
      ownerPhone = owner.phoneNumbers[0] || ''; 
    }

    // Create notification
    const notification = new Notification({
      recipientId: item.owner, 
      type: 'borrow_confirm', 
      message: `User ${user.firstName} ${user.lastName} has requested to return item "${item.name}". Message: ${message}`, 
      link: `/history`, 
    });
    await notification.save();

    // Email configuration
    if(ownerEmail.length > 0){
      const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail, 
      subject: 'OLD MARKET - RETURN REQUEST FOR BORROWED ITEM',
      text: `${user.firstName} ${user.lastName} has requested to return item "${item.name}". Message: ${message}. Check your dashboard: ${notification.link}`,
    };
    await transporter.sendMail(mailOptions);
    }
  
    return res.status(200).json({ success: true, message: 'Return request submitted and notifications sent', data: notification });
  } catch (error) {
    console.error('Error requesting return:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


module.exports = {
  createBorrow,
  getAllBorrowRecordByUserId,
  requestForReturnBorrow
};
