// routes/admin/stats.router.js
const express = require("express");
const { adminStatsController } = require("../../controller"); // Import controller mới
const router = new express.Router();

/**
 * @swagger
 * /admin/stats/dashboard:
 *   get:
 *     summary: Get overall dashboard statistics for admin
 *     tags:
 *       - admin/stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK. Returns key statistics like total users, items, transactions, revenue.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Dashboard statistics fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 100
 *                     totalItems:
 *                       type: number
 *                       example: 500
 *                     totalBuyTransactions:
 *                       type: number
 *                       example: 150
 *                     totalBorrowTransactions:
 *                       type: number
 *                       example: 80
 *                     totalRevenue:
 *                       type: number
 *                       example: 15000.75
 *                     totalBuyRevenue:
 *                       type: number
 *                       example: 12000.00
 *                     totalBorrowRevenue:
 *                       type: number
 *                       example: 3000.75
 *                     totalReports:
 *                       type: number
 *                       example: 25
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if roleProtected middleware is used)
 *       500:
 *         description: Internal Server Error
 */
router.get("/dashboard", adminStatsController.getDashboardStats);

module.exports = router;