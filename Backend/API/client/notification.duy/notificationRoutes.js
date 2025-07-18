// backend/API/client/notification.duy/notificationRoutes.js
const express = require('express');
const { authenticate } = require('../../../middleware/guards/authen.middleware'); // Đường dẫn đến middleware xác thực

const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    // Không import createNotification ở đây vì nó là hàm tiện ích nội bộ được gọi từ các controller khác
} = require('../../../controller/notification.duy/notificationController'); // Đường dẫn đến Notification Controller

const router = express.Router();

// [GET] Lấy danh sách thông báo cho người dùng hiện tại
// Ví dụ: /api/notifications?status=unread&limit=10&skip=0
router.get('/', authenticate, getNotifications);

// [PATCH] Đánh dấu một thông báo cụ thể là đã đọc
// Ví dụ: /api/notifications/mark-read/notificationId123
router.patch('/mark-read/:id', authenticate, markNotificationAsRead);

// [PATCH] Đánh dấu tất cả thông báo chưa đọc là đã đọc
// Ví dụ: /api/notifications/mark-all-read
router.patch('/mark-all-read', authenticate, markAllNotificationsAsRead);

// [DELETE] Xóa một thông báo cụ thể
// Ví dụ: /api/notifications/notificationId123
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;