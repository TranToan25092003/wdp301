// models/Borrow.js
const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    totalTime: {
      type: Number,
      required: [true, "Total time is required"],
      min: [0, "Total time cannot be negative"],
    },
    borrowers: {
      type: String,
      required: [true, "Borrower is required"],
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
const Borrow = mongoose.model("Borrow", borrowSchema);

module.exports = Borrow;
