const { Mongoose, default: mongoose } = require("mongoose");
const Category = require("../../model/category.model");
const Item = require("../../model/item.model");
const { clerkClient } = require("../../config/clerk");
const { Follow, Borrow, Buy } = require("../../model");
const {
  createNotification,
} = require("../notification.duy/notificationController");
const logActivity = require("../../utils/activityLogger");
const Status = require("../../model/status.model"); // THÊM DÒNG NÀY ĐỂ IMPORT MODEL STATUS
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("typeId", "name")
      .populate("categoryId", "name")
      .populate("statusId", "name")
      .exec();

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching items",
    });
  }
};

const getRecentItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const items = await Item.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("typeId", "name")
      .populate("categoryId", "name")
      .populate("statusId", "name")
      .exec();

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching recent items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent items",
    });
  }
};

const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const items = await Item.find({ categoryId })
      .populate("typeId", "name")
      .populate("categoryId", "name")
      .populate("statusId", "name");

    res.status(200).json({
      success: true,
      count: items.length,
      category: {
        _id: category._id,
        name: category.name,
        image: category.image,
        tags: category.tags,
      },
      data: items,
    });
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching items by category.",
    });
  }
};

const getRecentItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const recentItems = await Item.find({ categoryId })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("typeId", "name")
      .populate("categoryId", "name")
      .populate("statusId", "name");

    res.status(200).json({
      success: true,
      count: recentItems.length,
      category: {
        _id: category._id,
        name: category.name,
        image: category.image,
        tags: category.tags,
      },
      data: recentItems,
    });
  } catch (error) {
    console.error("Error fetching recent items by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recent items by category.",
    });
  }
};

const getItemDetailById = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      res.status(500).json({
        success: false,
        message: "itemId must be in mongoose objectId format.",
      });
    }

    const item = await Item.findById(itemId)
      .populate("typeId", "name")
      .populate("categoryId", "name")
      .populate("statusId", "name");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    let userInfo = null;
    if (item.owner) {
      const user = await clerkClient.users.getUser(item.owner);

      if (user) {
        userInfo = {
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          imageUrl: user.imageUrl || "",
          hasImage: user.hasImage || false,
          emailAddresses:
            user.emailAddresses.map((email) => email.emailAddress) || [],
          phoneNumbers:
            user.phoneNumbers.map((phone) => phone.phoneNumber) || [],
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...item.toObject(),
        ownerInfo: userInfo,
      },
    });
  } catch (error) {
    console.error("Error fetching item detail:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching item detail.",
    });
  }
};

const filterItems = async (req, res) => {
  try {
    const {
      search,
      name,
      minPrice,
      maxPrice,
      ratePrice,
      owner,
      typeId,
      categoryId,
      statusId,
      startDate,
      endDate,
      page = 1,
      pageSize = 12,
    } = req.query;

    const query = {};

    if (search) {
      const searchWords = search
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (searchWords.length > 0) {
        // Find category IDs where category name matches the search words
        const categoryMatches = await Category.find({
          name: { $regex: searchWords.join("|"), $options: "i" },
        }).distinct("_id"); // Get only the _id values of matching categories

        const wordConditions = searchWords.map((word) => ({
          $or: [
            { name: { $regex: word, $options: "i" } },
            { description: { $regex: word, $options: "i" } },
            { categoryId: { $in: categoryMatches } }, // Include items with matching category IDs
          ],
        }));
        query.$or = wordConditions;
      }
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (ratePrice) {
      query.ratePrice = ratePrice;
    }

    if (owner) {
      query.owner = owner;
    }

    if (typeId) {
      query.typeId = typeId;
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (statusId) {
      query.statusId = statusId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Calculate skip and limit for pagination
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 12;
    const skip = (pageNum - 1) * pageSizeNum;

    // Fetch paginated items and total count
    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .populate("typeId categoryId statusId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSizeNum)
        .lean(),
      Item.countDocuments(query),
    ]);

    return res
      .status(200)
      .json({ success: true, data: items, total: totalItems });
  } catch (error) {
    console.error("Error filtering items:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      images,
      ratePrice,
      owner,
      typeId,
      categoryId,
      statusId,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !ratePrice ||
      !owner ||
      !typeId ||
      !categoryId ||
      !statusId
    ) {
      console.error("Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        receivedData: {
          name,
          description,
          price,
          ratePrice,
          owner,
          typeId,
          categoryId,
          statusId,
        },
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(typeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid typeId format",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId format",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid statusId format",
      });
    }

    const item = new Item({
      name,
      description,
      price,
      images: images || [],
      ratePrice,
      owner,
      typeId,
      categoryId,
      statusId,
      pendingChanges: null, // Đảm bảo không có pendingChanges khi tạo sản phẩm mới
    });

    console.log("Creating new item without pendingChanges:", {
      name,
      price,
      owner,
      statusId,
    });

    await item.save();
    try {
      // Lấy thông tin người dùng từ Clerk để có tên hiển thị trong log
      const ownerUser = await clerkClient.users.getUser(owner);
      let ownerName = "Người dùng ẩn danh";
      if (ownerUser) {
        const fullName = `${ownerUser.firstName || ""} ${
          ownerUser.lastName || ""
        }`.trim();
        if (fullName) {
          ownerName = fullName;
        } else if (ownerUser.username) {
          ownerName = ownerUser.username;
        } else if (ownerUser.emailAddresses?.length > 0) {
          ownerName = ownerUser.emailAddresses[0].emailAddress;
        }
      }

      await logActivity(
        owner,
        "ITEM_CREATED",
        `${ownerName} đã đăng tải vật phẩm mới: "${item.name}" (ID: ${item._id}).`,
        "Item",
        item._id,
        req
      );
      console.log(
        `Activity logged: Item "${item.name}" created by ${ownerName}.`
      );
    } catch (logError) {
      console.error("Error logging ITEM_CREATED activity:", logError);
    }

    // THÊM LOGIC GỬI THÔNG BÁO TẠI ĐÂY

    const io = req.app.get("socketio");

    // GỬI THÔNG BÁO CHO NGƯỜI THEO DÕI
    try {
      const followers = await Follow.find({ followedId: owner });

      if (followers.length > 0) {
        const ownerUser = await clerkClient.users.getUser(owner);

        let ownerName = "Người dùng";
        if (ownerUser) {
          const fullName = `${ownerUser.firstName || ""} ${
            ownerUser.lastName || ""
          }`.trim();
          if (fullName && fullName !== "") {
            ownerName = fullName;
          } else if (ownerUser.username) {
            ownerName = ownerUser.username;
          } else if (ownerUser.emailAddresses?.length > 0) {
            ownerName = ownerUser.emailAddresses[0].emailAddress;
          }
        }

        for (const follower of followers) {
          const newNotification = await createNotification({
            recipientId: follower.followerId,
            senderId: owner,
            type: "new_post",
            message: `${ownerName} đã đăng một vật phẩm mới: ${item.name}`,
            link: `/item/${item._id}`, // ✅ Chính xác với route
            sourceId: item._id,
            sourceModel: "Item",
            io: io,
          });

          // ✅ Gửi qua socket nếu có
          if (io) {
            io.to(follower.followerId).emit("new_notification", {
              ...newNotification._doc,
              sender: {
                id: ownerUser?.id,
                username: ownerUser?.username || ownerUser?.firstName,
                imageUrl: ownerUser?.imageUrl,
              },
            });
          }
        }

        console.log(
          `Sent new_post notifications to ${followers.length} followers of ${ownerName}.`
        );
      }
    } catch (notifyError) {
      console.error("Error sending notification:", notifyError);
    }

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Detailed error in createItem:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating item",
      error: error.message,
    });
  }
};

const getUserUploadedItems = async (req, res) => {
  try {
    const userId = req.userId; // Assuming middleware sets req.userId
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "No user ID provided" });
    }

    // Query database for items uploaded by the user
    const items = await Item.find({ owner: userId })
      .populate("typeId", "name")
      .populate("categoryId", "name")
      .populate("statusId", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Transform data to include relevant fields
    const formattedItems = await Promise.all(
      items.map(async (item) => {
        // Xử lý pendingChanges nếu có
        let pendingChangesWithCategory = null;
        if (
          item.pendingChanges &&
          Object.keys(item.pendingChanges).length > 0
        ) {
          pendingChangesWithCategory = { ...item.pendingChanges };

          // Thêm category name nếu có categoryId
          if (pendingChangesWithCategory.categoryId) {
            try {
              const category = await mongoose
                .model("Category")
                .findById(pendingChangesWithCategory.categoryId);
              if (category) {
                pendingChangesWithCategory.category = category.name;
              }
            } catch (err) {
              console.error(
                `Error fetching category for item ${item._id}:`,
                err
              );
              // Nếu không tìm được, sử dụng category hiện tại
              pendingChangesWithCategory.category = item.categoryId.name;
            }
          } else {
            pendingChangesWithCategory.category = item.categoryId.name;
          }
        }

        const baseItem = {
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          images: item.images,
          ratePrice: item.ratePrice,
          type: item.typeId.name,
          category: item.categoryId.name,
          status: item.statusId.name,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          pendingChanges: pendingChangesWithCategory,
        };

        // Sold item
        if (item.typeId.name === "Sell" && item.statusId.name === "Sold") {
          const buyRecord = await Buy.findOne({ itemId: item._id }).lean();
          if (buyRecord) {
            baseItem.purchaseDate = buyRecord.createdAt;
            baseItem.buyerId = buyRecord.buyer;
            try {
              const buyerInfo = await clerkClient.users.getUser(
                buyRecord.buyer
              );
              if (buyerInfo) {
                baseItem.buyer = {
                  name: `${buyerInfo.firstName || ""} ${
                    buyerInfo.lastName || ""
                  }`.trim(),
                  imageUrl: buyerInfo.imageUrl || "",
                  hasImage: buyerInfo.hasImage || false,
                  emailAddresses:
                    buyerInfo.emailAddresses.map(
                      (email) => email.emailAddress
                    ) || [],
                  phoneNumbers:
                    buyerInfo.phoneNumbers.map((phone) => phone.phoneNumber) ||
                    [],
                };
              }
            } catch (buyerError) {
              console.error(
                `Error fetching buyer details for ${buyRecord.buyer}:`,
                buyerError
              );
              baseItem.buyer = {
                name: "Unknown",
                imageUrl: "",
                hasImage: false,
                emailAddresses: [],
                phoneNumbers: [],
              };
            }
          }
        }

        if (
          item.typeId.name === "Borrow" &&
          item.statusId.name === "Borrowed"
        ) {
          const borrowRecords = await Borrow.find({ itemId: item._id })
            .sort({ startTime: -1 }) // Latest borrowing first
            .lean();

          if (borrowRecords.length > 0) {
            baseItem.borrowingHistory = await Promise.all(
              borrowRecords.map(async (borrow) => {
                const history = {
                  borrowId: borrow._id,
                  totalPrice: borrow.totalPrice,
                  startTime: borrow.startTime,
                  endTime: borrow.endTime,
                  borrowerId: borrow.borrowers,
                  borrower: null,
                };
                try {
                  const borrowerInfo = await clerkClient.users.getUser(
                    borrow.borrowers
                  );
                  if (borrowerInfo) {
                    history.borrower = {
                      name: `${borrowerInfo.firstName || ""} ${
                        borrowerInfo.lastName || ""
                      }`.trim(),
                      imageUrl: borrowerInfo.imageUrl || "",
                      hasImage: borrowerInfo.hasImage || false,
                      emailAddresses:
                        borrowerInfo.emailAddresses.map(
                          (email) => email.emailAddress
                        ) || [],
                      phoneNumbers:
                        borrowerInfo.phoneNumbers.map(
                          (phone) => phone.phoneNumber
                        ) || [],
                    };
                  }
                } catch (borrowerError) {
                  console.error(
                    `Error fetching borrower details for ${borrow.borrowers}:`,
                    borrowerError
                  );
                  history.borrower = {
                    name: "Unknown",
                    imageUrl: "",
                    hasImage: false,
                    emailAddresses: [],
                    phoneNumbers: [],
                  };
                }
                return history;
              })
            );
          }
        }

        return baseItem;
      })
    );

    return res.status(200).json({ success: true, data: formattedItems });
  } catch (error) {
    console.error("Error fetching user uploaded items:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// 📌 API: GET /api/items/by-owner/:ownerId
const getItemsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing ownerId" });
    }

    const items = await Item.find({ owner: ownerId })
      .select("_id name images owner") // chỉ trả về id và tên
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error("Error fetching items by owner:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Function to handle item edit requests that require approval
const submitItemEditRequest = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;
    const { name, description, price, categoryId, images } = req.body;

    console.log("Received edit request for item:", {
      itemId,
      userId,
      name,
      description,
      price,
      categoryId,
      imagesCount: images ? images.length : 0,
    });

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.log("Invalid item ID format:", itemId);
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    // Find the item
    const item = await Item.findById(itemId);

    if (!item) {
      console.log("Item not found:", itemId);
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check if the user is the owner of the item
    if (item.owner !== userId) {
      console.log("Unauthorized edit attempt:", {
        itemOwner: item.owner,
        requestedBy: userId,
      });
      return res.status(403).json({
        success: false,
        message: "You don't have permission to edit this item",
      });
    }

    // Check if item is eligible for editing (not sold, borrowed, or in auction)
    const statusName = (await item.populate("statusId")).statusId.name;
    const typeName = (await item.populate("typeId")).typeId.name;

    console.log("Item status check:", {
      itemId,
      status: statusName,
      type: typeName,
    });

    if (
      statusName === "Sold" ||
      statusName === "Borrowed" ||
      statusName === "In Auction"
    ) {
      console.log(`Cannot edit item with status ${statusName}:`, itemId);
      return res.status(400).json({
        success: false,
        message: `Cannot edit an item that is ${statusName}`,
      });
    }

    // Validate categoryId if provided
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      console.log("Invalid category ID format:", categoryId);
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    // Create a pending edit request in the database
    // Store the pending changes in the item document
    const pendingChanges = {
      name: name || item.name,
      description: description || item.description,
      price: price !== undefined ? Number(price) : item.price,
      categoryId: categoryId || item.categoryId,
      images: images || item.images,
      requestDate: new Date(),
      requestedBy: userId,
      status: "pending", // pending, approved, rejected
    };

    console.log(
      "Creating pending changes:",
      JSON.stringify(pendingChanges, null, 2)
    );

    // Assign the pending changes to the item
    item.pendingChanges = pendingChanges;

    // Set the item status to Pending
    try {
      const pendingStatus = await Status.findOne({ name: "Pending" });
      if (pendingStatus) {
        // Only update status if current status is not already "Pending"
        if (!item.statusId.equals(pendingStatus._id)) {
          console.log(`Updating item status to Pending for item ${itemId}`);
          item.statusId = pendingStatus._id;
        }
      } else {
        console.warn("Pending status not found in database");
      }
    } catch (statusError) {
      console.error("Error updating item status:", statusError);
    }

    try {
      await item.save();
      console.log("Edit request saved successfully for item:", itemId);
    } catch (saveError) {
      console.error("Error saving item with pending changes:", saveError);
      return res.status(500).json({
        success: false,
        message: "Failed to save edit request",
        error: saveError.message,
      });
    }

    // Notify admin about the edit request (could implement email or in-app notification)
    const io = req.app.get("socketio");
    if (io) {
      try {
        // Emit event to admin users
        io.to("admin").emit("item_edit_request", {
          itemId: item._id,
          itemName: item.name,
          requestDate: new Date(),
          requestedBy: userId,
        });
        console.log("Admin notification sent for edit request:", itemId);
      } catch (notifyError) {
        console.error("Error sending admin notification:", notifyError);
        // Continue even if notification fails
      }
    }

    // Get the updated item with populated fields for the response
    const updatedItem = await Item.findById(itemId)
      .populate("typeId")
      .populate("categoryId")
      .populate("statusId")
      .lean();

    // Lấy thêm thông tin category nếu có
    let categoryName = updatedItem.categoryId?.name || "Unknown";

    // Nếu có categoryId mới trong pendingChanges, cần lấy tên của category đó
    if (
      pendingChanges.categoryId &&
      pendingChanges.categoryId.toString() !==
        updatedItem.categoryId?._id?.toString()
    ) {
      try {
        const newCategory = await mongoose
          .model("Category")
          .findById(pendingChanges.categoryId);
        if (newCategory) {
          pendingChanges.category = newCategory.name; // Thêm tên category vào pendingChanges
        }
      } catch (err) {
        console.error("Error fetching category name:", err);
      }
    } else {
      // Sử dụng category hiện tại nếu không có thay đổi
      pendingChanges.category = categoryName;
    }

    // Format the response data
    const responseData = {
      id: updatedItem._id,
      name: updatedItem.name,
      description: updatedItem.description,
      price: updatedItem.price,
      category: categoryName,
      type: updatedItem.typeId?.name || "Unknown",
      status: updatedItem.statusId?.name || "Unknown",
      images: updatedItem.images,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt,
      pendingChanges: {
        ...pendingChanges,
        categoryId: pendingChanges.categoryId
          ? pendingChanges.categoryId.toString()
          : null,
      },
    };

    res.status(200).json({
      success: true,
      message: "Edit request submitted for approval",
      data: responseData,
    });
  } catch (error) {
    console.error("Error submitting item edit request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting edit request",
      error: error.message,
    });
  }
};

// Function to handle item delivery confirmation
const confirmItemDelivery = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    // Find the item
    const item = await Item.findById(itemId)
      .populate("statusId")
      .populate("typeId");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check if the user is the owner of the item
    if (item.owner !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to confirm delivery for this item",
      });
    }

    // Check if item status is "Pending Delivery"
    if (item.statusId.name !== "Pending Delivery") {
      return res.status(400).json({
        success: false,
        message: "This item is not in the 'Pending Delivery' status",
      });
    }

    // Find the "Awaiting Receipt" status
    const awaitingReceiptStatus = await Status.findOne({
      name: "Awaiting Receipt",
    });
    if (!awaitingReceiptStatus) {
      return res.status(500).json({
        success: false,
        message: "Unable to find required status in the system",
      });
    }

    // Update the item status to "Awaiting Receipt"
    item.statusId = awaitingReceiptStatus._id;
    await item.save();

    // Find the related buy record to update delivery status
    const buyRecord = await Buy.findOne({ itemId: item._id });
    if (buyRecord) {
      buyRecord.deliveryStatus = "delivered";
      buyRecord.deliveryDate = new Date();
      await buyRecord.save();
    }

    // Get buyer information for notification
    let buyerInfo = null;
    if (buyRecord) {
      try {
        const buyer = await clerkClient.users.getUser(buyRecord.buyer);
        if (buyer) {
          buyerInfo = {
            id: buyer.id,
            name: `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim(),
            imageUrl: buyer.imageUrl || "",
          };
        }
      } catch (error) {
        console.error("Error fetching buyer information:", error);
      }
    }

    // Send notification to buyer
    const io = req.app.get("socketio");
    if (io && buyRecord && buyerInfo) {
      try {
        // Create notification for buyer about delivered item
        const notification = await createNotification({
          recipientId: buyRecord.buyer,
          senderId: userId,
          type: "item_delivered",
          message: `Người bán đã xác nhận giao hàng: ${item.name}. Vui lòng xác nhận đã nhận được hàng.`,
          link: `/item/${item._id}`,
          sourceId: item._id,
          sourceModel: "Item",
          io: io,
        });

        // Send socket notification
        io.to(buyRecord.buyer).emit("new_notification", {
          ...notification._doc,
          sender: {
            id: userId,
            // Assuming we have seller info, otherwise this will be incomplete
            username: "Người bán",
            imageUrl: "",
          },
        });

        // Also emit a specific item status change event
        io.to(buyRecord.buyer).emit("item_delivered", {
          itemId: item._id,
          itemName: item.name,
          deliveryDate: new Date(),
        });

        console.log(
          `Delivery confirmation notification sent to buyer ${buyRecord.buyer}`
        );
      } catch (notifyError) {
        console.error("Error sending delivery notification:", notifyError);
      }
    }

    // Log the activity
    try {
      await logActivity(
        userId,
        "DELIVERY_CONFIRMED",
        `Người bán đã xác nhận giao hàng cho sản phẩm "${item.name}" (ID: ${item._id})`,
        "Item",
        item._id,
        req
      );
    } catch (logError) {
      console.error("Error logging delivery confirmation:", logError);
    }

    res.status(200).json({
      success: true,
      message: "Delivery confirmed successfully",
      data: {
        id: item._id,
        name: item.name,
        status: "Awaiting Receipt",
        statusId: awaitingReceiptStatus._id,
      },
    });
  } catch (error) {
    console.error("Error confirming item delivery:", error);
    res.status(500).json({
      success: false,
      message: "Server error while confirming delivery",
      error: error.message,
    });
  }
};

// Function to handle item receipt confirmation by the buyer
const confirmItemReceipt = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    // Find the item
    const item = await Item.findById(itemId)
      .populate("statusId")
      .populate("typeId");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Find the buy record to verify the buyer
    const buyRecord = await Buy.findOne({ itemId: item._id });
    if (!buyRecord) {
      return res.status(404).json({
        success: false,
        message: "Purchase record not found for this item",
      });
    }

    // Check if the user is the buyer
    if (buyRecord.buyer !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to confirm receipt for this item",
      });
    }

    // Check if item status is "Awaiting Receipt"
    if (item.statusId.name !== "Awaiting Receipt") {
      return res.status(400).json({
        success: false,
        message: "This item is not in the 'Awaiting Receipt' status",
      });
    }

    // Find the "Sold" status
    const soldStatus = await Status.findOne({ name: "Sold" });
    if (!soldStatus) {
      return res.status(500).json({
        success: false,
        message: "Unable to find required status in the system",
      });
    }

    // Update the item status to "Sold"
    item.statusId = soldStatus._id;
    await item.save();

    // Update the buy record
    buyRecord.receiptStatus = "confirmed";
    buyRecord.receiptDate = new Date();
    await buyRecord.save();

    // Transfer money to the seller
    try {
      const seller = await clerkClient.users.getUser(item.owner);
      const sellerCoin = Number.parseInt(seller.publicMetadata?.coin) || 0;

      // Add the item price to the seller's balance
      await clerkClient.users.updateUserMetadata(item.owner, {
        publicMetadata: {
          coin: sellerCoin + buyRecord.total,
        },
      });

      console.log(
        `Transferred ${buyRecord.total} coins to seller ${item.owner}`
      );
    } catch (transferError) {
      console.error("Error transferring money to seller:", transferError);
      // Continue with the process even if the transfer fails
      // Should have a separate admin process to resolve failed transfers
    }

    // Send notification to seller
    const io = req.app.get("socketio");
    if (io) {
      try {
        // Create notification for seller about receipt confirmation
        const notification = await createNotification({
          recipientId: item.owner,
          senderId: userId,
          type: "item_receipt_confirmed",
          message: `Người mua đã xác nhận nhận được hàng: ${item.name}. Số tiền đã được chuyển vào tài khoản của bạn.`,
          link: `/item/${item._id}`,
          sourceId: item._id,
          sourceModel: "Item",
          io: io,
        });

        // Send socket notification to seller
        io.to(item.owner).emit("new_notification", {
          ...notification._doc,
          sender: {
            id: userId,
            // Assuming we have buyer info, otherwise this will be incomplete
            username: "Người mua",
            imageUrl: "",
          },
        });

        // Also emit a specific item status change event
        io.to(item.owner).emit("payment_received", {
          itemId: item._id,
          itemName: item.name,
          amount: buyRecord.total,
          receiptDate: new Date(),
        });

        console.log(
          `Receipt confirmation notification sent to seller ${item.owner}`
        );
      } catch (notifyError) {
        console.error("Error sending receipt notification:", notifyError);
      }
    }

    // Log the activity
    try {
      await logActivity(
        userId,
        "RECEIPT_CONFIRMED",
        `Người mua đã xác nhận nhận hàng cho sản phẩm "${item.name}" (ID: ${item._id})`,
        "Item",
        item._id,
        req
      );
    } catch (logError) {
      console.error("Error logging receipt confirmation:", logError);
    }

    res.status(200).json({
      success: true,
      message: "Receipt confirmed successfully",
      data: {
        id: item._id,
        name: item.name,
        status: "Sold",
        statusId: soldStatus._id,
      },
    });
  } catch (error) {
    console.error("Error confirming item receipt:", error);
    res.status(500).json({
      success: false,
      message: "Server error while confirming receipt",
      error: error.message,
    });
  }
};

module.exports = {
  getAllItems,
  getItemsByCategory,
  getRecentItemsByCategory,
  getItemDetailById,
  getRecentItems,
  filterItems,
  createItem,
  getUserUploadedItems,
  getItemsByOwner,
  submitItemEditRequest,
  confirmItemDelivery,
  confirmItemReceipt,
};
