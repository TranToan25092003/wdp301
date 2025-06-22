// models/userViolation.model.js
const mongoose = require("mongoose");

const userViolationSchema = new mongoose.Schema(
  {
    userId: { // ID của người dùng vi phạm từ Clerk
      type: String,
      required: [true, "User ID is required"],
    },
    violationType: { // Loại vi phạm (ví dụ: 'rate_limit_exceeded', 'spam_content', 'duplicate_content')
      type: String,
      enum: [
        'rate_limit_exceeded',
        'spam_content',
        'duplicate_content',
        'suspicious_login', // Ví dụ: nếu bạn triển khai phát hiện đăng nhập bất thường
        'other_behavior'
      ],
      required: [true, "Violation type is required"],
    },
    description: { // Mô tả chi tiết về vi phạm
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    payload: { // Lưu trữ thêm dữ liệu liên quan (ví dụ: nội dung spam, IP, User-Agent)
      type: mongoose.Schema.Types.Mixed, // Có thể là JSON object
      default: {},
    },
    status: { // Trạng thái của bản ghi vi phạm (pending, reviewed, dismissed, escalated)
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'escalated'],
      default: 'pending',
      required: true,
    },
    // Nếu muốn liên kết với Item hoặc Report cụ thể
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: false,
    },
    relatedReportId: { // Nếu có một báo cáo thủ công liên quan
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const UserViolation = mongoose.model("UserViolation", userViolationSchema);

module.exports = UserViolation;