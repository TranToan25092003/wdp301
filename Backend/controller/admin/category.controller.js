const { Category } = require("../../model");

/**
 * ====================================
 * [GET] /admin/category
 * GET ALL CATEGORY
 * ====================================
 */
module.exports.getAllCategory = async (req, res) => {
  try {
    const listCategories = await Category.find();

    return res.json({
      data: listCategories,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "error at get all category",
    });
  }
};
