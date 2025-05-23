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
      type: String,
      required: [true, "Buyer is required"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item", // Reference to the Item model
      required: [true, "Item ID is required"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create the model
const Buy = mongoose.model("Buy", buySchema);

module.exports = Buy;
