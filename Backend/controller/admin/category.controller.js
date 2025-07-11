const { default: mongoose } = require("mongoose");
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

/**
 * ====================================
 * [POST] /admin/category/create
 * CREATE NEW CATEGORY
 * ====================================
 */
module.exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    console.log(name, image);
    const newCategory = await Category.create({
      name,
      image,
    });

    return res.json({ data: newCategory });
  } catch (error) {
    console.log(error);
    return res.json({ message: "error at create category" });
  }
};

/**
 * ====================================
 * [GET] /admin/category/check
 * CHECK CATEGORY EXIST
 * ====================================
 */
module.exports.checkCategory = async (req, res) => {
  try {
    const { name } = req.query;

    const category = await Category.findOne({
      name,
    });

    if (category) {
      return res.json({
        data: { exists: true },
      });
    }

    return res.json({
      data: { exists: false },
    });
  } catch (error) {
    console.log(error);
    return res.json({ message: "error at create CHECK CATEGORY EXIST" });
  }
};

const checkValidMongoId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return true;
  }

  return false;
};

/**
 * ====================================
 * [PATCH] /admin/category/update
 * update category information
 * ====================================
 */
module.exports.updateCategory = async (req, res) => {
  try {
    // [START] check exist category
    const id = req.params.id;

    if (!checkValidMongoId(id)) {
      return res.status(401).json({
        message: "Item does not exist",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(401).json({
        message: "Item does not exist",
      });
    }
    // [END] check exist category

    // -----------------------------------
    // [START] update category
    const { name, image } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          image,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // [END] update category
    return res.status(200).json({
      data: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "error at create update category information" });
  }
};
