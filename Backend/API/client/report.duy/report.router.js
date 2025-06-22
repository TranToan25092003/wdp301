// src/routes/report.router.js (Dành cho người dùng client)
const express = require("express");
const router = new express.Router();
const { createReport, validateReportInput } = require('../../../controller/report.duy/report.controller');
const { submitReportLimiter } = require("../../../middleware/rateLimiters");

// Giả định middleware xác thực người dùng (nếu có)
// const authMiddleware = require('../middleware/authMiddleware'); // Ví dụ

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Submit a new report from a user
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - userId
 *               - reportType
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Item description misleading"
 *               description:
 *                 type: string
 *                 example: "The item description stated 'new' but it's clearly used with scratches."
 *               userId:
 *                 type: string
 *                 description: ID of the user submitting the report (Clerk User ID)
 *                 example: "user_123abcXYZ"
 *               reportType:
 *                 type: string
 *                 enum: ['item_feedback', 'user_behavior', 'spam']
 *                 example: "item_feedback"
 *               reportedUserId:
 *                 type: string
 *                 description: ID of the user being reported (required for user_behavior, spam)
 *                 example: "user_xyzabc123"
 *               itemId:
 *                 type: string
 *                 description: ID of the item being reported (required for item_feedback)
 *                 example: "60c72b2f9f1b2c001c8e4d0f"
 *               rating:
 *                 type: integer
 *                 format: int32
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Star rating (required for item_feedback)
 *                 example: 3
 *     responses:
 *       201:
 *         description: Report submitted successfully
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
 *                   example: "Report submitted successfully"
 *                 reportId:
 *                   type: string
 *                   example: "60c72b2f9f1b2c001c8e4d10"
 *       400:
 *         description: Invalid input or content spam detected (violationDetected true)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 *                 violationDetected:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Too many requests, please try again later"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post(
  "/",
  // authMiddleware(), // Nếu có middleware xác thực, đặt nó ở đây
  submitReportLimiter, // Áp dụng Rate Limiter
  validateReportInput, // Áp dụng validation rules
  createReport // Controller để tạo báo cáo
);

module.exports = router;