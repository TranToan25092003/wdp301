// models/Auction.js
const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return this.startTime < value;
        },
        message: "End time must be after start time",
      },
    },
    startPrice: {
      type: Number,
      required: [true, "Start price is required"],
      min: [0, "Start price cannot be negative"],
    },
    currentPrice: {
      type: Number,
      required: [true, "Current price is required"],
      min: [0, "Current price cannot be negative"],
    },
    minBidIncrement: {
      type: Number,
      default: 0, // Default to 0 (no minimum increment)
      min: [0, "Minimum bid increment cannot be negative"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item", // Reference to the Item model
      required: [true, "Item ID is required"],
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status", // Reference to the Status model
      required: [true, "Status ID is required"],
    },
    settled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create the model
const Auction = mongoose.model("Auction", auctionSchema);

module.exports = Auction;
