// models/ActivityLog.model.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // ID từ Clerk (dạng user_xxx)
      required: true,
      trim: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        "ITEM_CREATED",
        "ITEM_UPDATED",
        "ITEM_DELETED",
        "ITEM_APPROVED",
        "ITEM_REJECTED",
        "BORROW_REQUESTED",
        "BORROW_CONFIRMED",
        "BORROW_RETURNED",
        "BORROW_LATE",
        "BUY_COMPLETED",
        "AUCTION_STARTED",
        "AUCTION_ENDED",
        "AUCTION_DELETED",
        "BID_PLACED",
        "USER_LOGIN",
        "USER_LOGOUT",
        "USER_REPORTED",
        "USER_VIOLATION_CREATED",
        "ADMIN_ACTION_BAN_USER",
        "ADMIN_ACTION_UNBAN_USER",
        "NOTIFICATION_SENT",
        "FOLLOW_CREATED",
        "FOLLOW_DELETED",
         "USER_FOLLOWED",
        "USER_UNFOLLOWED", // ✅ Đã thêm
        "CONTACT_FORM_SUBMITTED",
        // Thêm các loại hành động khác tùy theo nhu cầu
      ],
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    entityType: {
      type: String,
      required: false,
      enum: [
        "Item",
        "Borrow",
        "Buy",
        "Auction",
        "User",
        "Report",
        "UserViolation",
        "Notification",
        "Follow",
        "Bid",
        "Bill",
        "Category",
        "Type",
        "Status",
        "Session",
        "Contact",
        "Test",
        null,
      ],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: "entityType",
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
      maxlength: [500, "User Agent cannot exceed 500 characters"],
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Tối ưu truy vấn
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ actionType: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
