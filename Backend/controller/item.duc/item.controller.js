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

module.exports = {
  getAllItems,
};
