const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    userId: { 
      type: String,
      required: false, 
    },
    reportType: { 
      type: String,
      enum: ['item_feedback', 'user_behavior', 'spam', 'system_generated_violation', 'admin_action_ban', 'admin_action_unban'], // Thêm system_generated_violation
      default: 'item_feedback',
      required: [true, "Report type is required"],
    },
    reportedUserId: { 
      type: String,
      required: function() {
        return this.reportType === 'user_behavior' || 
               this.reportType === 'spam' || 
               this.reportType === 'system_generated_violation';
      },
    },
    itemId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: function() {
        return this.reportType === 'item_feedback';
      },
    },
    rating: { 
      type: Number,
      min: 1,
      max: 5,
      required: function() {
        return this.reportType === 'item_feedback';
      },
    },
    status: { // Trạng thái của phản hồi
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    payload: { 
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Thêm index để tối ưu truy vấn
reportSchema.index({ reportedUserId: 1, reportType: 1, createdAt: 1 });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;