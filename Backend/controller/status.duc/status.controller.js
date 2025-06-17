const { Status } = require("../../model");

const getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.status(200).json(statuses);
  } catch (error) {
    console.error("Failed to fetch all statuses:", error);
    res.status(500).json({ message: "Failed to fetch all statuses." });
  }
};

module.exports = {
    getAllStatuses
}