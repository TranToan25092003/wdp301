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
    const returnData = await getItems({
      statusId: "682fefcb4a0495973b61df59",
    });

    return res.json({
      data: returnData,
    });
  } catch (error) {
    return res.json({
      message: "errors in get items browse",
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
      .select("name description price images owner typeId categoryId statusId")
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
