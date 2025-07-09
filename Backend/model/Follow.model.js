// models/Follow.model.js
const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    followerId: { // ID của người dùng đang theo dõi (người gửi hành động "follow")
      type: String,
      required: [true, "Follower ID is required"],
      trim: true,
      // ref: "User", // Clerk ID không phải là ObjectId Mongoose, nên chỉ là tham chiếu khái niệm
      maxlength: [100, "Follower ID cannot exceed 100 characters"], // Giả định độ dài tối đa của Clerk ID
    },
    followedId: { // ID của người dùng được theo dõi (người bán/người mượn)
      type: String,
      required: [true, "Followed ID is required"],
      trim: true,
      // ref: "User", // Clerk ID không phải là ObjectId Mongoose, nên chỉ là tham chiếu khái niệm
      maxlength: [100, "Followed ID cannot exceed 100 characters"], // Giả định độ dài tối đa của Clerk ID
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Thêm chỉ mục duy nhất để đảm bảo mỗi người dùng chỉ có thể theo dõi một người khác một lần
followSchema.index({ followerId: 1, followedId: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);

module.exports = Follow;