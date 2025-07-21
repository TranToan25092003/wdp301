// backend/API/client/notification.duy/notificationRoutes.js
const express = require('express');
const { authenticate } = require('../../../middleware/guards/authen.middleware'); 

const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  
} = require('../../../controller/notification.duy/notificationController'); 

const router = express.Router();


router.get('/', authenticate, getNotifications);


router.patch('/mark-read/:id', authenticate, markNotificationAsRead);


router.patch('/mark-all-read', authenticate, markAllNotificationsAsRead);


router.delete('/:id', authenticate, deleteNotification);

module.exports = router;