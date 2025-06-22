// src/routes/userAdmin.router.js

const express = require("express");
const { userAdminController } = require("../../controller"); // Import controller mới

const router = new express.Router();

/**
 * @swagger
 * /admin/users/{userId}/ban:
 *   post:
 *     summary: Cấm một người dùng bởi ID của họ
 *     tags:
 *       - admin/users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần cấm (Clerk ID)
 *     requestBody:
 *       description: Lý do cấm người dùng (tùy chọn)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Vi phạm chính sách cộng đồng về spam nội dung."
 *     responses:
 *       200:
 *         description: Người dùng đã bị cấm thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User user_xxxxxx has been banned."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_xxxxxx"
 *                     isBanned:
 *                       type: boolean
 *                       example: true
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       400:
 *         description: Thiếu User ID.
 *       403:
 *         description: Không có quyền truy cập (nếu không phải admin).
 *       404:
 *         description: Không tìm thấy người dùng.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.post("/:userId/ban", userAdminController.banUser);

/**
 * @swagger
 * /admin/users/{userId}/unban:
 *   post:
 *     summary: Bỏ cấm một người dùng bởi ID của họ
 *     tags:
 *       - admin/users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần bỏ cấm (Clerk ID)
 *     responses:
 *       200:
 *         description: Người dùng đã được bỏ cấm thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User user_xxxxxx has been unbanned."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_xxxxxx"
 *                     isBanned:
 *                       type: boolean
 *                       example: false
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       400:
 *         description: Thiếu User ID.
 *       403:
 *         description: Không có quyền truy cập (nếu không phải admin).
 *       404:
 *         description: Không tìm thấy người dùng.
 *       500:
 *         description: Lỗi máy chủ nội bộ.
 */
router.post("/:userId/unban", userAdminController.unbanUser);

module.exports = router;