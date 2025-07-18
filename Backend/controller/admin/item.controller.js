const { default: mongoose } = require("mongoose");
const { Item, Status } = require("../../model");
const { clerkClient } = require("../../config/clerk");

// get items by condition
const getItems = async (condition, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const rawData = await Item.find(condition)
    .populate("typeId categoryId statusId")
    .skip(skip)
    .limit(limit);

  const totalItems = await Item.countDocuments(condition);

  const returnData = rawData.map(
    ({ _id, name, price, images, typeId, statusId, categoryId }) => {
      return {
        _id,
        name,
        price,
        image: images[0],
        type: typeId.name,
        status: statusId.name,
        category: categoryId.name,
      };
    }
  );

  return {
    data: returnData,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  };
};

// check item exist
const checkExistItem = async (condition) => {
  try {
    const itemExist = await Item.findOne(condition);

    if (itemExist) {
      return true;
    }

    return false;
  } catch (error) {
    return error;
  }
};

// [GET] /admin/items
module.exports.getAllItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build condition object
    const condition = {};

    // Only add status filter if provided
    if (status) {
      const statusDoc = await Status.findOne({
        name: { $regex: status, $options: "i" },
      });
      if (statusDoc) {
        condition.statusId = statusDoc._id;
      }
    }

    const result = await getItems(condition, parseInt(page), parseInt(limit));

    return res.json({
      data: result.data,
      pagination: {
        totalItems: result.totalItems,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in getting items",
      error: error.message,
    });
  }
};

// check valid mongo id
const checkValidMongoId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return true;
  }

  return false;
};

// [GET] /admin/items/browse
module.exports.getBrowseItem = async (req, res) => {
  try {
    // Find pending status
    const pendingStatus = await Status.findOne({ name: "Pending" });
    if (!pendingStatus) {
      return res.status(400).json({
        success: false,
        message: "Pending status not found",
      });
    }

    // 1. Find all items with pending status
    const pendingItems = await Item.find({ statusId: pendingStatus._id })
      .populate("typeId")
      .populate("categoryId")
      .populate("statusId")
      .lean();

    // 2. Get auctions for pending items that are of auction type
    const Auction = require("../../model/auction.model");
    const pendingItemIds = pendingItems
      .filter((item) => item.typeId?.name?.toLowerCase() === "auction")
      .map((item) => item._id);

    const pendingAuctions = await Auction.find({
      itemId: { $in: pendingItemIds },
    }).lean();

    // Create a map for quick auction lookup
    const auctionMap = {};
    pendingAuctions.forEach((auction) => {
      auctionMap[auction.itemId.toString()] = auction;
    });

    // 3. Format the data
    const formattedItems = pendingItems.map((item) => {
      // Determine if this is a new item or an updated item
      const isUpdated =
        item.pendingChanges && item.pendingChanges.status === "pending";

      return {
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.images && item.images.length > 0 ? item.images[0] : "",
        type: item.typeId?.name || "Unknown",
        status: item.statusId?.name || "Unknown",
        category: item.categoryId?.name || "Unknown",
        isUpdated: isUpdated,
        isAuction: item.typeId?.name?.toLowerCase() === "auction",
        hasAuction:
          item.typeId?.name?.toLowerCase() === "auction" &&
          auctionMap.hasOwnProperty(item._id.toString()),
        createdAt: item.createdAt,
        pendingChanges: isUpdated
          ? {
              name: item.pendingChanges.name,
              description: item.pendingChanges.description,
              price: item.pendingChanges.price,
              categoryId: item.pendingChanges.categoryId,
              images: item.pendingChanges.images || [],
              requestDate: item.pendingChanges.requestDate,
            }
          : null,
      };
    });

    // Sort items: updated items first, then by creation date (newest first)
    formattedItems.sort((a, b) => {
      if (a.isUpdated && !b.isUpdated) return -1;
      if (!a.isUpdated && b.isUpdated) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.json({
      data: {
        data: formattedItems,
        totalItems: formattedItems.length,
      },
    });
  } catch (error) {
    console.error("Error in getBrowseItem:", error);
    return res.status(500).json({
      message: "Error getting pending items",
      error: error.message,
    });
  }
};

/**
 * ====================================
 * [POST] /admin/items/approve
 * ====================================
 */
module.exports.approveItem = async (req, res) => {
  try {
    const itemId = req.body.itemId;
    const approve = req.body.approve;

    // check valid id
    if (!checkValidMongoId(itemId)) {
      return res.json({
        message: "item does not exist",
      });
    }

    // check exist item
    const isExist = await checkExistItem({
      _id: itemId,
    });

    if (!isExist) {
      return res.json({
        message: "item does not exist",
      });
    }

    let statusId;

    if (approve == true) {
      statusId = await Status.findOne({
        name: "Approved",
      });
    } else {
      statusId = await Status.findOne({
        name: "Rejected",
      });
    }

    await Item.findByIdAndUpdate(itemId, {
      statusId: statusId._id,
      rejectReason: req.body?.reason || "",
    });

    return res.json({
      message: "success",
    });
  } catch (error) {
    return res.json({
      message: "error in approve items",
    });
  }
};

/**
 * ====================================
 * [GET] /get/items/:id
 * ====================================
 */
module.exports.getItemById = async (req, res) => {
  try {
    const itemId = req.params.id;

    const isValidId = checkValidMongoId(itemId);

    if (!isValidId) {
      return res.json({
        message: "Item does not exist",
      });
    }

    const itemDetail = await Item.findById(itemId)
      .select(
        "name description price images owner typeId categoryId statusId pendingChanges"
      )
      .populate("typeId categoryId statusId")
      .lean();

    if (!itemDetail) {
      return res.json({
        message: "Item does not exist",
      });
    }

    const owner = await clerkClient.users.getUser(itemDetail.owner);

    const formatted = {
      _id: itemDetail._id,
      name: itemDetail.name,
      description: itemDetail.description,
      price: itemDetail.price,
      images: itemDetail.images,
      type: itemDetail.typeId?.name,
      category: {
        name: itemDetail.categoryId?.name,
        image: itemDetail.categoryId?.image,
      },
      status: itemDetail.statusId?.name,
      owner: {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.emailAddresses[0]?.emailAddress || null,
        image: owner.imageUrl,
      },
      pendingChanges: itemDetail.pendingChanges || null,
    };

    return res.json({
      data: formatted,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "error in get item by id items",
    });
  }
};

/**
 * ====================================
 * [POST] /admin/items/:id/approve-edit
 * ====================================
 */
module.exports.approveEditRequest = async (req, res) => {
  try {
    const itemId = req.params.id;
    const adminId = req.body.adminId;

    // Validate MongoDB ID
    if (!checkValidMongoId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    // Check if the item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check if there's a pending edit request
    if (!item.pendingChanges || item.pendingChanges.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "No pending edit request found",
      });
    }

    // Apply the changes from pendingChanges to the item
    item.name = item.pendingChanges.name;
    item.description = item.pendingChanges.description;
    item.price = item.pendingChanges.price;

    // Apply category changes if provided
    if (item.pendingChanges.categoryId) {
      item.categoryId = item.pendingChanges.categoryId;
    }

    // Apply image changes if provided
    if (item.pendingChanges.images && item.pendingChanges.images.length > 0) {
      item.images = item.pendingChanges.images;
    }

    // Update the pendingChanges status
    item.pendingChanges.status = "approved";
    item.pendingChanges.reviewedBy = adminId;
    item.pendingChanges.reviewDate = new Date();

    await item.save();

    // Notify the item owner that their edit request was approved
    try {
      const io = req.app.get("socketio");
      if (io) {
        io.to(item.owner).emit("edit_request_approved", {
          itemId: item._id,
          itemName: item.name,
        });
      }
    } catch (notifyError) {
      console.error("Error sending notification:", notifyError);
    }

    return res.status(200).json({
      success: true,
      message: "Edit request approved successfully",
      data: {
        item: {
          _id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId,
          images: item.images,
        },
      },
    });
  } catch (error) {
    console.error("Error approving edit request:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while approving edit request",
      error: error.message,
    });
  }
};

/**
 * ====================================
 * [POST] /admin/items/:id/reject-edit
 * ====================================
 */
module.exports.rejectEditRequest = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { adminId, rejectReason } = req.body;

    // Validate MongoDB ID
    if (!checkValidMongoId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    // Check if the reason is provided
    if (!rejectReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // Check if the item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check if there's a pending edit request
    if (!item.pendingChanges || item.pendingChanges.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "No pending edit request found",
      });
    }

    // Update the pendingChanges status without applying the changes
    item.pendingChanges.status = "rejected";
    item.pendingChanges.reviewedBy = adminId;
    item.pendingChanges.reviewDate = new Date();
    item.pendingChanges.rejectReason = rejectReason;

    await item.save();

    // Notify the item owner that their edit request was rejected
    try {
      const io = req.app.get("socketio");
      if (io) {
        io.to(item.owner).emit("edit_request_rejected", {
          itemId: item._id,
          itemName: item.name,
          reason: rejectReason,
        });
      }
    } catch (notifyError) {
      console.error("Error sending notification:", notifyError);
    }

    return res.status(200).json({
      success: true,
      message: "Edit request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting edit request:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while rejecting edit request",
      error: error.message,
    });
  }
};
