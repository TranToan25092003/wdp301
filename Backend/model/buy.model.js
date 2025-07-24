// models/Buy.js
const mongoose = require("mongoose");

const buySchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },
    buyer: {
      // Người mua (Buyer)
      type: String,
      required: [true, "Buyer is required"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item", // Reference to the Item model
      required: [true, "Item ID is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Buy = mongoose.model("Buy", buySchema);

module.exports = Buy;
