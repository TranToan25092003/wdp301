// models/Buy.js
const mongoose = require("mongoose");

const buySchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },
    buyer: { // Người mua (Buyer)
      type: String,
      required: [true, "Buyer is required"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item", // Reference to the Item model
      required: [true, "Item ID is required"],
    },
    // *** THÊM MỚI QUAN TRỌNG: Chủ sở hữu của Item được mua (Owner) ***
    owner: {
      type: String,
      required: [true, "Item owner ID is required"],
    },
    status: {
      type: String,
      enum: ['completed', 'canceled'], // Các trạng thái có thể có
      default: 'completed',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Middleware để tự động lấy owner từ Item và gán vào Buy trước khi lưu
buySchema.pre('save', async function(next) {
  // Chỉ chạy nếu đây là bản ghi mới hoặc itemId đã thay đổi
  if (this.isNew || this.isModified('itemId')) {
    // Để tránh lỗi circular dependency, cần import Model tại chỗ
    const Item = mongoose.model('Item');
    const item = await Item.findById(this.itemId);
    if (item) {
      this.owner = item.owner;
    } else {
      // Xử lý lỗi nếu item không tìm thấy
      return next(new Error('Item not found for buy transaction. Cannot set owner.'));
    }
  }
  next();
});

const Buy = mongoose.model("Buy", buySchema);

module.exports = Buy;