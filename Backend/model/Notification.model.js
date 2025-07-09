// models/Notification.model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String,
      required: true,
    },
    type: {
      // Loại thông báo (ví dụ: 'new_post', 'follow', 'message', 'system')
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
      ], // Thêm các loại thông báo bạn có thể cần
      required: [true, "Notification type is required"],
      trim: true,
    },
    message: {
      // Nội dung hiển thị của thông báo
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Notification message cannot exceed 500 characters"],
    },
    link: {
      // Liên kết để người dùng nhấp vào thông báo (ví dụ: /items/item-id-xyz)
      type: String,
      default: "#", // Liên kết mặc định nếu không có
      trim: true,
      maxlength: [200, "Notification link cannot exceed 200 characters"],
    },
    isRead: {
      // Trạng thái đã đọc hay chưa đọc
      type: Boolean,
      default: false,
    },
    // Các trường tùy chọn để tham chiếu đến nguồn gốc của thông báo
    sourceId: {
      // ID của đối tượng gây ra thông báo (ví dụ: _id của Item, _id của Buy/Borrow transaction)
      type: mongoose.Schema.Types.ObjectId, // Sử dụng ObjectId vì nó tham chiếu tới các model Mongoose khác
      refPath: "sourceModel", // Tham chiếu động đến model được chỉ định bởi sourceModel
      required: false, // Không phải mọi thông báo đều có một nguồn cụ thể, ví dụ: thông báo hệ thống
    },
    sourceModel: {
      // Tên của Model mà sourceId tham chiếu tới (ví dụ: 'Item', 'Buy', 'Borrow')
      type: String,
      required: function () {
        // Chỉ required nếu sourceId tồn tại
        return this.sourceId != null;
      },
      enum: ["Item", "User", "Buy", "Borrow", "Report"], // Liệt kê tất cả các tên Model có thể là nguồn
      trim: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Thêm index để tối ưu truy vấn thông báo theo userId và trạng thái đọc/chưa đọc
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
