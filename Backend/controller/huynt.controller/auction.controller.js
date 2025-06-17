const Auction = require("../../model/auction.model");
const Bid = require("../../model/bid.model");
const Status = require("../../model/status.model");

exports.createAuction = async (req, res) => {
  try {
    const { startTime, endTime, startPrice, itemId, statusId } = req.body;

    if (!startTime || !endTime || !startPrice || !itemId || !statusId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const status = await Status.findById(statusId);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    const auction = new Auction({
      startTime,
      endTime,
      startPrice,
      currentPrice: startPrice,
      itemId,
      statusId,
    });

    await auction.save();
    res.status(201).json({ message: "Auction created successfully", auction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    await Auction.findByIdAndDelete(id);
    await Bid.deleteMany({ auctionId: id });

    res.status(200).json({ message: "Auction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAuctionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id)
      .populate("itemId")
      .populate("statusId");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const bids = await Bid.find({ auctionId: id }).sort({ createdAt: -1 });

    res.status(200).json({ auction, bids });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("itemId")
      .populate("statusId")
      .sort({ startTime: -1 });

    res.status(200).json({ auctions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
