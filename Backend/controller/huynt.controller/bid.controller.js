const Auction = require("../../model/auction.model");
const Bid = require("../../model/bid.model");
const { Status } = require("../../model/status.model");
const { clerkClient } = require("../../config/clerk");
const Item = require("../../model/item.model");
const ActivityLog = require("../../model/ActivityLog.model");
exports.placeBid = async (req, res) => {
  try {
    // Lấy userId từ middleware authenticate (ưu tiên bảo mật)
    const userId = req.userId || req.body.userId;
    const { auctionId, amount } = req.body;

    if (!auctionId || !amount || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    // Kiểm tra đăng nhập
    if (!userId) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để đặt giá!" });
    }

    // Lấy thông tin user từ Clerk
    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }
    const userCoin = Number.parseInt(user.publicMetadata?.coin) || 0;

    // Kiểm tra đủ coin
    if (userCoin < amount) {
      return res
        .status(400)
        .json({ message: "Bạn không đủ coin để đặt giá này!" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Không cho phép seller đặt giá sản phẩm của chính mình
    const item = await Item.findById(auction.itemId);
    if (item && item.owner && item.owner.toString() === userId.toString()) {
      return res.status(400).json({
        message: "Bạn không thể đặt giá cho sản phẩm của chính mình.",
      });
    }

    const now = new Date();
    if (now < auction.startTime || now > auction.endTime) {
      return res.status(400).json({ message: "Auction is not active" });
    }

    // Calculate the increment amount
    const incrementAmount = amount - auction.currentPrice;

    // Validate that the bid is higher than current price
    if (incrementAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Bid amount must be higher than current price" });
    }

    // Check if bid meets minimum increment requirement
    if (
      auction.minBidIncrement > 0 &&
      incrementAmount < auction.minBidIncrement
    ) {
      return res.status(400).json({
        message: `Bid increment must be at least ${auction.minBidIncrement}`,
      });
    }

    // Không trừ coin ở đây, chỉ kiểm tra đủ điều kiện
    const bid = new Bid({
      amount,
      userId,
      auctionId,
    });
    await bid.save();

    // Update current price in the auction
    auction.currentPrice = amount;
    await auction.save();

    // Get updated bids list with newest first
    const updatedBids = await Bid.find({ auctionId }).sort({ createdAt: -1 });

    // Get socket.io instance from the app
    const io = req.app.get("socketio");
    if (io) {
      // Emit optimistic update with comprehensive information for real-time display
      io.to(auctionId).emit("newBid", {
        id: bid._id.toString(),
        userId: userId,
        amount: amount,
        createdAt: bid.createdAt,
        auctionId: auctionId,
        userName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Bidder",
      });

      // Also emit the full update for data consistency
      io.to(auctionId).emit("bidUpdate", {
        auction: {
          ...auction.toObject(),
          currentPrice: amount,
        },
        bids: updatedBids,
      });
    }
    // Log the activity
     try {
      await ActivityLog.create({
        userId: userId, 
        actionType: 'BID_PLACED', 
       
        description: `Người dùng ${user.firstName || user.emailAddresses[0]?.emailAddress || userId} đã đặt giá ${amount} cho sản phẩm "${item?.name || 'Không rõ tên'}".`, // Mô tả chi tiết
        entityType: 'Bid', 
        entityId: bid._id, 
        ipAddress: req.ip, 
        userAgent: req.headers['user-agent'], 
        payload: {
          auctionId: auctionId,
          bidAmount: amount,
          auctionItemName: item?.name, 
          bidId: bid._id,
        },
      });
      console.log("✅ Activity Log for BID_PLACED created successfully!");
    } catch (logError) {
      console.error("❌ Lỗi khi tạo Activity Log cho BID_PLACED:", logError);
     
    }
    res.status(201).json({
      message: "Bid placed successfully",
      bid: bid.toObject(),
      auction: auction.toObject(),
      bids: updatedBids,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
