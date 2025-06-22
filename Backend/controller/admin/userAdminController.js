// Backend/controller/admin/userAdminController.js

const { Report } = require('../../model'); // Đường dẫn đến model của bạn (vẫn giữ import nếu bạn dùng Report ở nơi khác trong file này, hoặc có thể xóa nếu không)
const { clerkClient } = require('../../config/clerk'); // Đường dẫn đến config Clerk của bạn


module.exports.banUser = async (req, res) => {
  const { userId } = req.params; // ID của người dùng cần cấm (từ URL param)
  const { reason, durationDays } = req.body; // Lý do cấm và thời gian cấm (từ body của request)
  const adminId = req.userId; // ID của admin đang thực hiện hành động (từ middleware authenticate)

  // Kiểm tra quyền admin
  if (req.role !== "org:admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required to ban a user." });
  }

  try {
    let banEndTime = null;
    if (durationDays && typeof durationDays === 'number' && durationDays > 0) {
      banEndTime = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    // Lấy thông tin người dùng hiện tại để đảm bảo không bị ghi đè các publicMetadata khác
    const clerkUser = await clerkClient.users.getUser(userId);
    const currentPublicMetadata = clerkUser.publicMetadata || {};

    // Cập nhật publicMetadata của người dùng trong Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...currentPublicMetadata, // Giữ lại các metadata hiện có
        isBanned: true,
        banReason: reason || "Vi phạm quy định của hệ thống.",
        banStartTime: new Date().toISOString(),
        banEndTime: banEndTime,
        bannedBy: adminId,
      },
    });

    // === ĐÃ XÓA BLOCK TẠO BẢN GHI REPORT CHO HÀNH ĐỘNG BAN ===
    // Trước đây có đoạn:
    // await Report.create({ ... });
    // Đoạn này đã được gỡ bỏ để không tạo bản ghi mới trong collection Report.

    console.log(`User ${userId} was banned by admin ${adminId} for reason: ${reason || 'No reason provided'}. End time: ${banEndTime || 'Permanent'}`);
    res.status(200).json({
      success: true,
      message: `Người dùng ${userId} đã bị cấm thành công.`,
      isBanned: true,
      banReason: reason,
      banEndTime: banEndTime
    });
  } catch (error) {
    console.error(`Error banning user ${userId}:`, error);
    // Kiểm tra các lỗi cụ thể từ Clerk (ví dụ: người dùng không tồn tại)
    if (error.status === 404) {
      return res.status(404).json({ message: "User not found in Clerk." });
    }
    res.status(500).json({ message: "Lỗi khi cấm người dùng.", error: error.message });
  }
};

/**
 * Bỏ cấm một người dùng bằng cách cập nhật publicMetadata của họ trong Clerk.
 * @param {object} req - Đối tượng Request của Express.
 * @param {object} res - Đối tượng Response của Express.
*/
module.exports.unbanUser = async (req, res) => {
  const { userId } = req.params; // ID của người dùng cần bỏ cấm
  const adminId = req.userId; // ID của admin đang thực hiện hành động

  // Kiểm tra quyền admin
  if (req.role !== "org:admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required to unban a user." });
  }

  try {
    // Lấy thông tin người dùng hiện tại
    const clerkUser = await clerkClient.users.getUser(userId);
    const currentPublicMetadata = clerkUser.publicMetadata || {};

    // Cập nhật publicMetadata của người dùng trong Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...currentPublicMetadata, // Giữ lại các metadata hiện có
        isBanned: false,
        banReason: null, // Xóa lý do ban
        banStartTime: null, // Xóa thời gian bắt đầu ban
        banEndTime: null, // Xóa thời gian kết thúc ban
        bannedBy: null, // Xóa admin đã ban
      },
    });

    // === ĐÃ XÓA BLOCK TẠO BẢN GHI REPORT CHO HÀNH ĐỘNG UNBAN ===
    // Trước đây có đoạn:
    // await Report.create({ ... });
    // Đoạn này đã được gỡ bỏ để không tạo bản ghi mới trong collection Report.

    console.log(`User ${userId} was unbanned by admin ${adminId}.`);
    res.status(200).json({
      success: true,
      message: `Người dùng ${userId} đã được bỏ cấm thành công.`,
      isBanned: false
    });
  } catch (error) {
    console.error(`Error unbanning user ${userId}:`, error);
    if (error.status === 404) {
      return res.status(404).json({ message: "User not found in Clerk." });
    }
    res.status(500).json({ message: "Lỗi khi bỏ cấm người dùng.", error: error.message });
  }
};

/**
 * Lấy trạng thái cấm của một người dùng cụ thể.
 * @param {object} req - Đối tượng Request của Express.
 * @param {object} res - Đối tượng Response của Express.
*/
module.exports.getBanStatus = async (req, res) => {
  const { userId } = req.params;

  // Kiểm tra quyền admin
  if (req.role !== "org:admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required to get ban status." });
  }

  try {
    const clerkUser = await clerkClient.users.getUser(userId);

    const isBanned = clerkUser.publicMetadata?.isBanned || false;
    const banReason = clerkUser.publicMetadata?.banReason || null;
    const banStartTime = clerkUser.publicMetadata?.banStartTime || null;
    const banEndTime = clerkUser.publicMetadata?.banEndTime || null;
    const bannedBy = clerkUser.publicMetadata?.bannedBy || null;

    res.status(200).json({
      success: true,
      userId,
      isBanned,
      banReason,
      banStartTime,
      banEndTime,
      bannedBy
    });
  } catch (error) {
    console.error(`Error fetching ban status for user ${userId}:`, error);
    if (error.status === 404) {
      return res.status(404).json({ message: "User not found in Clerk." });
    }
    res.status(500).json({ message: "Lỗi khi lấy trạng thái cấm.", error: error.message });
  }
};