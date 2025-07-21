// routes/activityLogRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticate,
} = require("../../../middleware/guards/authen.middleware");
const logActivity = require("../../../utils/activityLogger");

// Ghi log login
router.post("/login", authenticate, async (req, res) => {
  try {
    const { user, userId } = req;

    await logActivity(
      userId,
      "USER_LOGIN",
      `Người dùng ${
        user.firstName || user.emailAddresses[0]?.emailAddress
      } đã đăng nhập.`,
      "Session", // ✅ Phù hợp với enum
      null,       // ❌ Không dùng userId vì không phải ObjectId
      req,
      user
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi ghi log login:", err);
    res.status(500).json({ success: false, message: "Login log failed" });
  }
});

// Ghi log logout
router.post("/logout", authenticate, async (req, res) => {
  try {
    const { user, userId } = req;

    await logActivity(
      userId,
      "USER_LOGOUT",
      `Người dùng ${
        user.firstName || user.emailAddresses[0]?.emailAddress
      } đã đăng xuất.`,
      "Session", // ✅ Đúng enum (phân biệt hoa thường)
      null,       // ❌ Không truyền userId nếu không phải ObjectId
      req,
      user
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi ghi log logout:", err);
    res.status(500).json({ success: false, message: "Logout log failed" });
  }
});

module.exports = router;
