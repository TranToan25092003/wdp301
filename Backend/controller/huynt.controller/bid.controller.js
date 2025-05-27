const Auction = require("../../model/auction.model");
const Bid = require("../../model/bid.model");
const { Status } = require("../../model/status.model");

exports.placeBid = async (req, res) => {
  try {
    const { auctionId, amount, userId } = req.body;

    if (!auctionId || !amount || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const now = new Date();
    if (now < auction.startTime || now > auction.endTime) {
      return res.status(400).json({ message: "Auction is not active" });
    }

    if (amount <= auction.currentPrice) {
      return res
        .status(400)
        .json({ message: "Bid amount must be higher than current price" });
    }

    const bid = new Bid({
      amount,
      userId,
      auctionId,
    });
    await bid.save();

    auction.currentPrice = amount;
    await auction.save();

    const updatedBids = await Bid.find({ auctionId }).sort({ createdAt: -1 });

    const io = req.app.get("socketio");
    if (io) {
      io.to(auctionId).emit("bidUpdate", {
        auction: { ...auction.toObject(), currentPrice: amount },
        bids: updatedBids,
      });
    }

    res
      .status(201)
      .json({ message: "Bid placed successfully", bid: bid.toObject() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
