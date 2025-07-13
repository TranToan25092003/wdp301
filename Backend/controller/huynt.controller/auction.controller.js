const { clerkClient } = require("../../config/clerk");
const Auction = require("../../model/auction.model");
const Bid = require("../../model/bid.model");
const Status = require("../../model/status.model");

// Hàm kiểm tra và settle các auction đã hết hạn
const checkAndSettleEndedAuctions = async (io) => {
  try {
    // Tìm các auction đã hết hạn và chưa settle
    const endedAuctions = await Auction.find({
      endTime: { $lte: new Date() },
      settled: false,
    });

    // Settle từng auction
    for (const auction of endedAuctions) {
      const settleResult = await exports.settleAuction(auction._id);

      // Emit event nếu settle thành công
      if (settleResult && settleResult.success && io) {
        io.to(auction._id.toString()).emit("auctionEnded", {
          auctionId: auction._id.toString(),
          winnerId: settleResult.winnerId,
          winnerName: settleResult.winnerName,
          amount: settleResult.amount,
          message: settleResult.message,
        });
      }
    }
  } catch (error) {
    console.error("Error checking ended auctions:", error);
  }
};

exports.createAuction = async (req, res) => {
  try {
    const {
      startTime,
      endTime,
      startPrice,
      itemId,
      statusId,
      minBidIncrement,
    } = req.body;

    if (!startTime || !endTime || !startPrice || !itemId || !statusId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate that start time is at least 5 minutes in the future
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const startTimeDate = new Date(startTime);

    if (startTimeDate < fiveMinutesFromNow) {
      return res.status(400).json({
        message: "Start time must be at least 5 minutes from now",
      });
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
      minBidIncrement: minBidIncrement || 0, // Use provided value or default to 0
    });

    await auction.save();

    // Schedule kiểm tra kết thúc auction
    const io = req.app.get("socketio");
    const msUntilEnd = new Date(endTime) - new Date();
    if (msUntilEnd > 0) {
      setTimeout(() => {
        checkAndSettleEndedAuctions(io);
      }, msUntilEnd + 1000); // +1s để chắc chắn đã hết giờ
    }

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

    let auction = await Auction.findById(id)
      .populate("itemId")
      .populate("statusId");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Khi truy cập chi tiết auction, nếu đã hết giờ và chưa settle thì tự động settle
    if (new Date() > auction.endTime && !auction.settled) {
      const settleResult = await exports.settleAuction(id);
      // Reload lại auction sau khi settle
      auction = await Auction.findById(id)
        .populate("itemId")
        .populate("statusId");
      // Gửi socket event thông báo kết thúc đấu giá nếu settle thành công
      if (settleResult && settleResult.success) {
        const io = req.app.get("socketio");
        if (io) {
          io.to(id).emit("auctionEnded", {
            auctionId: id,
            winnerId: settleResult.winnerId,
            winnerName: settleResult.winnerName,
            amount: settleResult.amount,
            message: settleResult.message,
          });
        }
      }
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

// Hàm settleAuction: trừ coin người thắng khi auction kết thúc
exports.settleAuction = async (auctionId) => {
  // Tìm và update settled = true chỉ khi settled = false (atomic)
  const auction = await Auction.findOneAndUpdate(
    { _id: auctionId, settled: false },
    { $set: { settled: true } },
    { new: true }
  );
  if (!auction)
    return { success: false, message: "Auction not found or already settled" };
  if (new Date() < auction.endTime)
    return { success: false, message: "Auction not ended yet" };

  const highestBid = await Bid.findOne({ auctionId }).sort({ amount: -1 });
  if (!highestBid) return { success: false, message: "No bids" };

  const winnerId = highestBid.userId;
  const winner = await clerkClient.users.getUser(winnerId);
  const userCoin = Number.parseInt(winner.publicMetadata?.coin) || 0;
  const winnerName =
    `${winner.firstName || ""} ${winner.lastName || ""}`.trim() || winnerId;

  if (userCoin >= highestBid.amount) {
    await clerkClient.users.updateUserMetadata(winnerId, {
      publicMetadata: {
        coin: userCoin - highestBid.amount,
      },
    });
    return {
      success: true,
      message: `Đấu giá đã kết thúc! Người thắng: ${winnerName}, giá: ${highestBid.amount}`,
      winnerId,
      winnerName,
      amount: highestBid.amount,
      remainingCoin: userCoin - highestBid.amount,
    };
  } else {
    return { success: false, message: "Winner does not have enough coin" };
  }
};
