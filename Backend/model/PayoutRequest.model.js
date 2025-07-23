const mongoose = require("mongoose");

const PayoutRequestSchema = new mongoose.Schema(
  {
    customerClerkId: { type: String, required: true },
    cardNumber: { type: String },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "rejected", "completed"],
      default: "pending",
    },
    action: {
      type: String,
      enum: ["minus", "plus"],
    },
    adminNote: { type: String },
  },
  { timestamps: true } // Tự động thêm createdAt, updatedAt
);

const PayoutRequest = mongoose.model("PayoutRequest", PayoutRequestSchema);

module.exports = PayoutRequest;
