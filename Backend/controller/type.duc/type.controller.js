const Type = require("../../model/type.model");

const getAllTypes = async (req, res) => {
  try {
    const types = await Type.find();
    res.status(200).json(types);
  } catch (error) {
    console.error("Failed to fetch all types:", error);
    res.status(500).json({ message: "Failed to fetch all types." });
  }
};

module.exports = {
    getAllTypes
}