// Backend/utils/activityLogger.js

const ActivityLog = require("../model/ActivityLog.model"); // Đảm bảo đường dẫn đúng đến mô hình ActivityLog

const logActivity = async (
  userId,
  actionType,
  description,
  entityType = null,
  entityId = null,
  req = null, // Truyền đối tượng req để lấy IP và User-Agent
  payload = {}
) => {
  try {
    const newLog = new ActivityLog({
      userId,
      actionType,
      description,
      entityType,
      entityId,
      ipAddress: req ? req.ip : undefined, // Lấy IP nếu có
      userAgent: req ? req.headers["user-agent"] : undefined, // Lấy User-Agent nếu có
      payload,
    });
    await newLog.save();
    // console.log(`Activity logged: ${actionType} by ${userId}`); // Có thể bỏ comment để debug
  } catch (error) {
    console.error("Error logging activity:", error);
    // Quan trọng: Không ném lỗi ở đây để không làm gián đoạn luồng chính của ứng dụng
  }
};

module.exports = logActivity;