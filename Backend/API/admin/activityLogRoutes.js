// routes/admin/activityLogRoutes.js
const express = require('express');
const router = express.Router();


const { activityLogAdminController } = require("../../controller");

router.get('/', activityLogAdminController.getAllActivityLogs);


router.get('/:id', activityLogAdminController.getActivityLogById);

router.delete('/:id', activityLogAdminController.deleteActivityLog);

module.exports = router;