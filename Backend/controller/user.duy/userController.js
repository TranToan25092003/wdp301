// controller/user.duy/usercontroller.js
const Item = require("../../model/item.model");
const { clerkClient } = require("../../config/clerk");

exports.getUsersWithPosts = async (req, res) => {
  try {
    // Lấy danh sách userId có sản phẩm
    const posts = await Item.aggregate([
      {
        $group: {
          _id: "$owner", // owner là Clerk userId
          totalPosts: { $sum: 1 },
        },
      },
    ]);

    const userIds = posts.map((p) => p._id);

    const usersData = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const user = await clerkClient.users.getUser(userId);
          return {
            userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            imageUrl: user.imageUrl,
            totalPosts: posts.find((p) => p._id === userId)?.totalPosts || 0,
          };
        } catch (err) {
          console.warn(`Không lấy được thông tin user ${userId} từ Clerk`);
          return null;
        }
      })
    );

    const filteredUsers = usersData.filter(Boolean);

    res.json({ success: true, users: filteredUsers });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
