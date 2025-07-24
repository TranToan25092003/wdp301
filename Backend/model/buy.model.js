// models/Buy.js
const mongoose = require("mongoose");

const buySchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: true,
    },
    buyer: {
      type: String,
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    receiptStatus: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    receiptDate: {
      type: Date,
    },
    isAuction: {
      type: Boolean,
      default: false,
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Buy", buySchema);
