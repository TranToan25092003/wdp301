const { Buy, Borrow, Auction, Bid, Item, Report } = require("../../model");
const { clerkClient } = require("../../config/clerk");

const getValidFeedbackItems = async (req, res) => {
  try {
    const { sellerClerkId, currentUserId } = req.params;

    if (!sellerClerkId || !currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Both sellerClerkId and currentUserId are required",
      });
    }

    const sellerItems = await Item.find({ owner: sellerClerkId })
      .select("_id name images")
      .lean();

    if (!sellerItems.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const validItemIds = new Set();

    // ✅ CẢI TIẾN: Chấp nhận nhiều status hợp lệ cho Buy transactions
    const validBuyStatuses = [
      "confirmed", 
      "completed", 
      "delivered", 
      "finished", 
      "success", 
      "paid",
      "received"
    ];

    const buyTransactions = await Buy.find({
      buyer: currentUserId,
      owner: sellerClerkId,
      status: { $in: validBuyStatuses } // Sử dụng $in để chấp nhận nhiều status
    }).select("itemId status").lean(); // Thêm status để debug

    console.log(`✅ Found ${buyTransactions.length} buy transactions with valid statuses`);
    buyTransactions.forEach((buy) => {
      console.log(`📦 Buy transaction: ${buy.itemId} - Status: ${buy.status}`);
      validItemIds.add(buy.itemId.toString());
    });

    // ✅ CẢI TIẾN: Chấp nhận nhiều status cho Borrow transactions
    const validBorrowStatuses = [
      "returned", 
      "completed", 
      "finished",
      "borrowed",
      "pending"
    ];

    const borrowTransactions = await Borrow.find({
      borrowers: currentUserId,
      owner: sellerClerkId,
      status: { $in: validBorrowStatuses }
    }).select("itemId status").lean();

    console.log(`✅ Found ${borrowTransactions.length} borrow transactions with valid statuses`);
    borrowTransactions.forEach((borrow) => {
      console.log(`📚 Borrow transaction: ${borrow.itemId} - Status: ${borrow.status}`);
      validItemIds.add(borrow.itemId.toString());
    });

    // ✅ GIỮ NGUYÊN: Logic auction vẫn ổn
    const auctions = await Auction.find({
      itemId: { $in: sellerItems.map((item) => item._id) },
      settled: true,
    }).populate("itemId", "owner").lean();

    for (const auction of auctions) {
      if (auction.itemId?.owner?.toString() === sellerClerkId) {
        const highestBid = await Bid.findOne({
          auctionId: auction._id,
        })
          .sort({ amount: -1 })
          .lean();
        
        if (highestBid && highestBid.userId === currentUserId) {
          console.log(`🏆 Won auction item: ${auction.itemId._id}`);
          validItemIds.add(auction.itemId._id.toString());
        }
      }
    }

    const validItems = sellerItems.filter((item) =>
      validItemIds.has(item._id.toString())
    );

    console.log(`✅ Final result: ${validItems.length} valid items for feedback`);

    res.status(200).json({
      success: true,
      count: validItems.length,
      data: validItems,
    });
  } catch (error) {
    console.error("Error fetching valid feedback items:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching valid feedback items",
      error: error.message,
    });
  }
};

// ✅ THÊM FUNCTION ĐỂ DỄ DÀNG CẬP NHẬT STATUS SAU NÀY
const updateValidStatuses = {
  buy: [
    "confirmed", 
    "completed", 
    "delivered", 
    "finished", 
    "success", 
    "paid",
    "received"
  ],
  borrow: [
    "returned", 
    "completed", 
    "finished"
  ]
};

module.exports = {
  getValidFeedbackItems,
  updateValidStatuses // Export để có thể sử dụng ở nơi khác nếu cần
};