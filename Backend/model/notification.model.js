// models/Notification.model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "new_post",
        "follow",
        "message",
        "system",
        "buy_confirm",
        "borrow_confirm",
        "unreturned",
        "admin_action",
      ], 
      required: [true, "Notification type is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Notification message cannot exceed 500 characters"],
    },
    link: {
      type: String,
      default: "#", 
      trim: true,
      maxlength: [200, "Notification link cannot exceed 200 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId, 
      refPath: "sourceModel", 
      required: false, 
    },
    sourceModel: {
      type: String,
      required: function () {
        return this.sourceId != null;
      },
      enum: ["Item", "User", "Buy", "Borrow", "Report"], 
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;