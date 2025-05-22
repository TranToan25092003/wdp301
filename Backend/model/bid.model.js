// models/Bid.js
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Bid amount is required"],
      min: [0, "Bid amount cannot be negative"],
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction", // Reference to the Auction model
      required: [true, "Auction ID is required"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create the model
const Bid = mongoose.model("Bid", bidSchema);

module.exports = Bid;
