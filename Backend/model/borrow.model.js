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
    borrowers: { // Người mượn (Borrower)
      type: String,
      required: [true, "Borrower is required"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item", // Reference to the Item model
      required: [true, "Item ID is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'borrowed', 'returned', 'late', 'unreturned', 'canceled'],
      default: 'pending',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Borrow = mongoose.model("Borrow", borrowSchema);

module.exports = Borrow;