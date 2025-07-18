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

exports.getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id)
      .populate("itemId")
      .populate("statusId");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.status(200).json({ data: auction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      startTime,
      endTime,
      startPrice,
      currentPrice,
      minBidIncrement,
      statusId,
    } = req.body;

    // Find the auction
    let auction = await Auction.findById(id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Validate required fields
    if (!startTime || !endTime || !startPrice || startPrice <= 0) {
      return res.status(400).json({
        message: "All fields are required and prices must be positive",
      });
    }

    // Validate that start time is at least 5 minutes in the future if it's being changed
    const now = new Date();
    const startTimeDate = new Date(startTime);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (startTimeDate < fiveMinutesFromNow) {
      return res.status(400).json({
        message: "Start time must be at least 5 minutes from now",
      });
    }

    // Validate that end time is after start time
    if (new Date(endTime) <= startTimeDate) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    // Update auction fields
    auction.startTime = startTime;
    auction.endTime = endTime;
    auction.startPrice = startPrice;
    auction.currentPrice = currentPrice || startPrice;
    auction.minBidIncrement = minBidIncrement || 0;

    // Only update statusId if provided and valid
    if (statusId) {
      const status = await Status.findById(statusId);
      if (!status) {
        return res.status(404).json({ message: "Status not found" });
      }
      auction.statusId = statusId;
    }

    await auction.save();

    // Schedule check for auction end
    const msUntilEnd = new Date(endTime) - new Date();
    if (msUntilEnd > 0) {
      setTimeout(() => {
        checkAndSettleEndedAuctions(global.io);
      }, msUntilEnd + 1000); // +1s to ensure it's ended
    }

    res.status(200).json({ message: "Auction updated successfully", auction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Hàm settleAuction: trừ coin người thắng khi auction kết thúc và cộng coin cho người bán
exports.settleAuction = async (auctionId) => {
  // Tìm và update settled = true chỉ khi settled = false (atomic)
  const auction = await Auction.findOneAndUpdate(
    { _id: auctionId, settled: false },
    { $set: { settled: true } },
    { new: true }
  ).populate("itemId");

  if (!auction)
    return { success: false, message: "Auction not found or already settled" };
  if (new Date() < auction.endTime)
    return { success: false, message: "Auction not ended yet" };

  const highestBid = await Bid.findOne({ auctionId }).sort({ amount: -1 });
  if (!highestBid) return { success: false, message: "No bids" };

  // Get winner information
  const winnerId = highestBid.userId;
  const winner = await clerkClient.users.getUser(winnerId);
  const winnerCoin = Number.parseInt(winner.publicMetadata?.coin) || 0;
  const winnerName =
    `${winner.firstName || ""} ${winner.lastName || ""}`.trim() || winnerId;

  // Get seller information
  const sellerId = auction.itemId.owner;
  const seller = await clerkClient.users.getUser(sellerId);
  const sellerCoin = Number.parseInt(seller.publicMetadata?.coin) || 0;
  const sellerName =
    `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || sellerId;

  // Check if winner has enough coins
  if (winnerCoin >= highestBid.amount) {
    try {
      // Calculate new coin balances
      const newWinnerCoinBalance = winnerCoin - highestBid.amount;
      const newSellerCoinBalance = sellerCoin + highestBid.amount;

      // Deduct coins from winner
      await clerkClient.users.updateUserMetadata(winnerId, {
        publicMetadata: {
          coin: newWinnerCoinBalance,
        },
      });

      // Add coins to seller
      await clerkClient.users.updateUserMetadata(sellerId, {
        publicMetadata: {
          coin: newSellerCoinBalance,
        },
      });

      // Update item status to "Sold"
      const soldStatus = await Status.findOne({ name: "Sold" });
      if (soldStatus) {
        auction.itemId.statusId = soldStatus._id;
        await auction.itemId.save();
      }

      // Get socket.io instance from the global app object
      const io = global.io;
      if (io) {
        // Emit coin update events to both users
        io.to(winnerId).emit("coinUpdate", {
          userId: winnerId,
          newBalance: newWinnerCoinBalance,
          transaction: {
            type: "debit",
            amount: highestBid.amount,
            description: `Auction win: ${auction.itemId.name}`,
          },
        });

        io.to(sellerId).emit("coinUpdate", {
          userId: sellerId,
          newBalance: newSellerCoinBalance,
          transaction: {
            type: "credit",
            amount: highestBid.amount,
            description: `Auction sale: ${auction.itemId.name}`,
          },
        });
      }

      return {
        success: true,
        message: `Đấu giá đã kết thúc! Người thắng: ${winnerName}, giá: ${highestBid.amount}`,
        winnerId,
        winnerName,
        sellerId,
        sellerName,
        amount: highestBid.amount,
        remainingCoin: newWinnerCoinBalance,
      };
    } catch (error) {
      console.error("Error during auction settlement:", error);
      return { success: false, message: "Error processing transaction" };
    }
  } else {
    return { success: false, message: "Winner does not have enough coin" };
  }
};
