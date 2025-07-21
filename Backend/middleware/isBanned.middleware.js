// Backend/middleware/isBanned.middleware.js

const { clerkClient } = require("../config/clerk"); 

module.exports.checkBanStatus = async (req, res, next) => {
 
  const userId = req.userId; 

 
  if (!userId) {
    return next(); 
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

    
    next();
  } catch (error) {
    console.error(`Error checking ban status for user ${userId}:`, error);
   
    res.status(500).json({ message: "Lỗi khi kiểm tra trạng thái tài khoản." });
  }
};