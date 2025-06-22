const { clerkClient } = require('../config/clerk'); 


exports.checkBanStatus = async (req, res, next) => {
  
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized: User ID not found." });
  }

  try {
    const clerkUser = await clerkClient.users.getUser(req.userId);

    
    const isBanned = clerkUser.publicMetadata && clerkUser.publicMetadata.isBanned === true;
    const banReason = (clerkUser.publicMetadata && clerkUser.publicMetadata.banReason) || "Bạn đã bị cấm truy cập tính năng này.";

    if (isBanned) {
      console.warn(`User ${req.userId} is banned. Reason: ${banReason}`);
      return res.status(403).json({
        message: `Bạn không có quyền thực hiện hành động này. ${banReason}`,
        isBanned: true,
      });
    }

    
    next();
  } catch (error) {
    console.error(`Error checking ban status for user ${req.userId}:`, error);
    
    return res.status(500).json({ message: "Internal server error when checking ban status." });
  }
};