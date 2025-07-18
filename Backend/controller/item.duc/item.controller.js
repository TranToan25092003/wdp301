const { Mongoose, default: mongoose } = require("mongoose");
const Category = require("../../model/category.model");
const Item = require("../../model/item.model");
const { clerkClient } = require("../../config/clerk");
const { Follow, Borrow, Buy } = require("../../model"); // THÊM DÒNG NÀY ĐỂ IMPORT MODEL FOLLOW
const {
  createNotification,
} = require("../notification.duy/notificationController"); // THÊM DÒNG NÀY ĐỂ IMPORT HÀM GỬI THÔNG BÁO
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
    });

    await item.save();
    // ===============================================
    // THÊM LOGIC GỬI THÔNG BÁO TẠI ĐÂY
    // ===============================================
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
      .select("_id name") // chỉ trả về id và tên
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

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    // Find the item
    const item = await Item.findById(itemId);

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
        message: "You don't have permission to edit this item",
      });
    }

    // Check if item is eligible for editing (not sold, borrowed, or in auction)
    const statusName = (await item.populate("statusId")).statusId.name;
    const typeName = (await item.populate("typeId")).typeId.name;

    if (
      statusName === "Sold" ||
      statusName === "Borrowed" ||
      statusName === "In Auction"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit an item that is ${statusName}`,
      });
    }

    // Validate categoryId if provided
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    // Create a pending edit request in the database
    // Store the pending changes in the item document
    item.pendingChanges = {
      name: name || item.name,
      description: description || item.description,
      price: price || item.price,
      categoryId: categoryId || item.categoryId,
      images: images || item.images,
      requestDate: new Date(),
      requestedBy: userId,
      status: "pending", // pending, approved, rejected
    };

    await item.save();

    // Notify admin about the edit request (could implement email or in-app notification)
    const io = req.app.get("socketio");
    if (io) {
      // Emit event to admin users
      io.to("admin").emit("item_edit_request", {
        itemId: item._id,
        itemName: item.name,
        requestDate: new Date(),
        requestedBy: userId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Edit request submitted for approval",
      data: {
        itemId: item._id,
        pendingChanges: item.pendingChanges,
      },
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
};
