// models/Item.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [100000, "Description cannot exceed 10000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    images: {
      type: [String], // Array of strings to store image URLs
      default: [],
    },
    ratePrice: {
      type: String,
      enum: {
        values: ["hour", "day", "no"],
        message: 'Rate price must be either "hour" or "day"',
      },
      required: [true, "Rate price is required"],
      default: "no",
    },
    rejectReason: {
      type: String,
    },
    owner: {
      type: String,
      required: [true, "Owner ID is required"],
    },
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type", // Reference to the Type model
      required: [true, "Type ID is required"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      required: [true, "Category ID is required"],
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status", // Reference to the Status model
      required: [true, "Status ID is required"],
    },
    pendingChanges: {
      name: String,
      description: String,
      price: Number,
      categoryId: mongoose.Schema.Types.ObjectId,
      images: [String],
      requestDate: Date,
      requestedBy: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      reviewedBy: String,
      reviewDate: Date,
      rejectReason: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create the model
const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
