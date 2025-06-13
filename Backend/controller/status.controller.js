const Status = require("../model/status.model");

const getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching statuses",
    });
  }
};

module.exports = {
  getAllStatuses,
};
