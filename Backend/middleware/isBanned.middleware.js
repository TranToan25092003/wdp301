// Backend/middleware/isBanned.middleware.js

const { clerkClient } = require("../config/clerk"); // Đảm bảo đường dẫn đúng đến config Clerk của bạn

module.exports.checkBanStatus = async (req, res, next) => {
  // Lấy userId từ req (đã được thiết lập bởi middleware authenticate hoặc tương tự)
  const userId = req.userId; // Giả sử req.userId đã có từ middleware authenticate

  // Nếu không có userId (ví dụ: guest user), cho phép tiếp tục hoặc xử lý khác tùy theo logic của bạn
  // Ở đây ta giả định chỉ kiểm tra với user đã đăng nhập.
  if (!userId) {
    return next(); // Hoặc res.status(401).json({ message: "Vui lòng đăng nhập." });
  }

  try {
    const user = await clerkClient.users.getUser(userId);

    // Kiểm tra publicMetadata.isBanned
    if (user.publicMetadata?.isBanned === true) {
      const banReason = user.publicMetadata?.banReason || "vi phạm quy định của hệ thống";
      const banEndTime = user.publicMetadata?.banEndTime ? new Date(user.publicMetadata.banEndTime).toLocaleString() : "vĩnh viễn";

      return res.status(403).json({
        success: false,
        message: `Tài khoản của bạn đã bị cấm. Lý do: ${banReason}. Thời gian kết thúc: ${banEndTime}.`,
        isBanned: true,
      });
    }

    // Nếu không bị cấm, cho phép request đi tiếp
    next();
  } catch (error) {
    console.error(`Error checking ban status for user ${userId}:`, error);
    // Nếu có lỗi khi lấy thông tin user từ Clerk, coi như không bị cấm hoặc xử lý lỗi khác
    // Tuy nhiên, để đảm bảo an toàn, bạn có thể cân nhắc chặn luôn nếu không thể xác định trạng thái
    res.status(500).json({ message: "Lỗi khi kiểm tra trạng thái tài khoản." });
  }
};