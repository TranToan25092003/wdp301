const Type = require("../model/type.model");

const getAllTypes = async (req, res) => {
  try {
    const types = await Type.find();
    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching types",
    });
  }
};

module.exports = {
  getAllTypes,
};
