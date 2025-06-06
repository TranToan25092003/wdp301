const { Mongoose, default: mongoose } = require('mongoose');
const Category = require('../../model/category.model');
const Item = require('../../model/item.model');


const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('typeId', 'name')
      .populate('categoryId', 'name')
      .populate('statusId', 'name')
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
      .populate('typeId', 'name')
      .populate('categoryId', 'name')
      .populate('statusId', 'name')
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
    
    if(!mongoose.Types.ObjectId.isValid(itemId)){
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

    res.status(200).json({
      success: true,
      data: item,
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
    } = req.query;

    const query = {};

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

    const items = await Item.find(query)
      .populate("typeId categoryId statusId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("Error filtering items:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllItems,
  getItemsByCategory,
  getRecentItemsByCategory,
  getItemDetailById,
  getRecentItems,
  filterItems
};
