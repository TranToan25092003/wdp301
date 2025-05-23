const Category = require("../../model/category.model");
const Item = require("../../model/item.model");

const getAllCategoriesWithStats = async (req, res) => {
  try {
    const categories = await Category.find({});

    const itemCounts = await Item.aggregate([
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 },
        },
      },
    ]);

    const itemCountMap = {};
    itemCounts.forEach(({ _id, count }) => {
      itemCountMap[_id.toString()] = count;
    });

    const formattedCategories = categories.map((cat) => ({
      _id: cat._id,
      title: cat.name,
      image: cat.image,
      tags: cat.tags,
      products: itemCountMap[cat._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error("Failed to fetch categories", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllCategoriesWithStats,
};
