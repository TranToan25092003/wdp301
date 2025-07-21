// controllers/admin/activityLogAdminController.js
const ActivityLog = require("../../model/ActivityLog.model");
const { clerkClient } = require("../../config/clerk");

/**
 * [GET] /api/admin/activity-logs
 * Lấy danh sách lịch sử hoạt động với phân trang, sắp xếp và lọc.
 */
const getAllActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    const { userId, actionType, entityType, startDate, endDate } = req.query;

    if (userId) query.userId = userId;
    if (actionType) query.actionType = actionType;
    if (entityType) query.entityType = entityType;

    // Lọc theo ngày tháng
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // Đặt cuối ngày
        dateFilter.$lte = endDateObj;
      }
      query.createdAt = dateFilter;
    }

    const activityLogs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalLogs = await ActivityLog.countDocuments(query);

    // Lấy thông tin người dùng từ Clerk
    const userIds = [...new Set(activityLogs.map((log) => log.userId))].filter(Boolean);
    const usersData = {};

    if (userIds.length > 0) {
      const usersPromises = userIds.map(async (id) => {
        try {
          const user = await clerkClient.users.getUser(id);
          usersData[id] =
            user.firstName || user.lastName
              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
              : user.emailAddresses[0]?.emailAddress || id;
        } catch (clerkError) {
          usersData[id] = id;
          console.warn(`Không thể lấy thông tin người dùng ${id} từ Clerk:`, clerkError.message);
        }
      });
      await Promise.all(usersPromises);
    }

    const logsWithUserNames = activityLogs.map((log) => ({
      ...log._doc,
      userName: usersData[log.userId] || log.userId,
    }));

    res.status(200).json({
      success: true,
      count: logsWithUserNames.length,
      page,
      pages: Math.ceil(totalLogs / limit),
      total: totalLogs,
      data: logsWithUserNames,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử hoạt động:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy lịch sử hoạt động",
      error: error.message,
    });
  }
};

// [GET] /api/admin/activity-logs/:id
const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const activityLog = await ActivityLog.findById(id);

    if (!activityLog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi lịch sử hoạt động",
      });
    }

    let userName = activityLog.userId;
    if (activityLog.userId) {
      try {
        const user = await clerkClient.users.getUser(activityLog.userId);
        userName =
          user.firstName || user.lastName
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : user.emailAddresses[0]?.emailAddress || activityLog.userId;
      } catch (clerkError) {
        console.warn(`Không thể lấy thông tin người dùng ${activityLog.userId} từ Clerk:`, clerkError.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...activityLog._doc,
        userName,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết lịch sử hoạt động:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy chi tiết lịch sử hoạt động",
      error: error.message,
    });
  }
};

// [DELETE] /api/admin/activity-logs/:id
const deleteActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ActivityLog.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi để xóa",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Đã xóa bản ghi thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa log:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi xóa",
      error: error.message,
    });
  }
};

module.exports = {
  getAllActivityLogs,
  getActivityLogById,
  deleteActivityLog,
};