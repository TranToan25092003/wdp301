// backend/controller/notification.duy/notificationController.js

const { Notification } = require('../../model'); 
const { clerkClient } = require("../../config/clerk");

/**
 * UTILITY FUNCTION: Create a new notification
 */
const createNotification = async ({
  recipientId,
  type,
  message,
  senderId = null,
  entityId = null,
  entityRef = null,
  link = null,
  io = null // Thêm io để socket emit
}) => {
  try {
    if (!recipientId || !type || !message) {
      console.error("Error creating notification: Missing required fields");
      return;
    }

    const newNotification = await Notification.create({
      recipientId,
      senderId,
      type,
      message,
      entityId,
      entityRef,
      link,
    });

    // ✅ Emit socket event nếu có io truyền vào
    if (io) {
      io.to(recipientId).emit("new_notification", {
        _id: newNotification._id,
        message,
        type,
        link,
        isRead: false,
        createdAt: newNotification.createdAt
      });
    }

    return newNotification;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};


/**
 * [GET] /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const recipientId = req.userId;
    const { status, limit = 10, skip = 0 } = req.query;

    let query = { recipientId };

    if (status === 'read') query.isRead = true;
    else if (status === 'unread') query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipientId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      total: totalCount,
      unreadCount,
      message: "Notifications retrieved successfully.",
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving notifications.",
      error: error.message,
    });
  }
};

/**
 * [PATCH] /api/notifications/mark-read/:id
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const recipientId = req.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or permission denied.",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking notification as read.",
      error: error.message,
    });
  }
};

/**
 * [PATCH] /api/notifications/mark-all-read
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const recipientId = req.userId;

    const result = await Notification.updateMany(
      { recipientId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read.`,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking all notifications as read.",
      error: error.message,
    });
  }
};

/**
 * [DELETE] /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const recipientId = req.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or permission denied.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting notification.",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
