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
    // *** THÊM MỚI QUAN TRỌNG: Trạng thái của giao dịch mượn ***
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'borrowed', 'returned', 'late', 'unreturned', 'canceled'],
      default: 'pending',
      required: true,
    },
    // *** THÊM MỚI QUAN TRỌNG: Thời gian trả thực tế (nếu có) ***
    actualReturnTime: {
      type: Date,
      required: false, // Chỉ có nếu trạng thái là 'returned' hoặc 'late'
    },
    // *** THÊM MỚI QUAN TRỌNG: Chủ sở hữu của Item được mượn (Owner) ***
    // Điều này sẽ giúp dễ dàng tính toán "Người bán uy tín"
    owner: {
      type: String,
      required: [true, "Item owner ID is required"],
    }
  },
  {
    timestamps: true,
  }
);

// Middleware để tự động lấy owner từ Item và gán vào Borrow trước khi lưu
borrowSchema.pre('save', async function(next) {
  // Chỉ chạy nếu đây là bản ghi mới hoặc itemId đã thay đổi
  if (this.isNew || this.isModified('itemId')) {
    // Để tránh lỗi circular dependency, cần import Model tại chỗ
    const Item = mongoose.model('Item');
    const item = await Item.findById(this.itemId);
    if (item) {
      this.owner = item.owner;
    } else {
      // Xử lý lỗi nếu item không tìm thấy
      return next(new Error('Item not found for borrow transaction. Cannot set owner.'));
    }
  }
  next();
});

const Borrow = mongoose.model("Borrow", borrowSchema);

module.exports = Borrow;