const express = require("express");
const { reportAdminController } = require("../../controller");
const router = new express.Router();

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: Get comprehensive admin report including transactions, reports, and statistics
 *     tags:
 *       - admin/reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering transactions and reports (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering transactions and reports (YYYY-MM-DD)
 *       - in: query
 *         name: searchUser
 *         schema:
 *           type: string
 *         description: Search by user name, email, or Clerk ID
 *       - in: query
 *         name: searchItem
 *         schema:
 *           type: string
 *         description: Search by item name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: OK. Returns an object with transactions, reports, and statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "Buy"
 *                           transactionId:
 *                             type: string
 *                             example: "60c72b2f9f1b2c001c8e4d0f"
 *                           item:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               price:
 *                                 type: number
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           totalAmount:
 *                             type: number
 *                           totalTime:
 *                             type: number
 *                             description: Only for 'Borrow' transactions
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                             description: Only for 'Borrow' transactions
 *                           endTime:
 *                             type: string
 *                             format: date-time
 *                             description: Only for 'Borrow' transactions
 *                           date:
 *                             type: string
 *                             format: date-time
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                 reports:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           reportId:
 *                             type: string
 *                             example: "60c72b2f9f1b2c001c8e4d10"
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           item:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                           reportType:
 *                             type: string
 *                             example: "technical_issue"
 *                           status:
 *                             type: string
 *                             example: "pending"
 *                           adminNotes:
 *                             type: string
 *                             example: "Contacted user for more details."
 *                           date:
 *                             type: string
 *                             format: date-time
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     topTransactingUsers:
 *                       type: array
 *                       description: Top users by transaction count
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               id: 
 *                                 type: string
 *                               name: 
 *                                 type: string
 *                               email: 
 *                                 type: string
 *                           transactionCount:
 *                             type: integer
 *                             example: 15
 *                     mostReportedUsers:
 *                       type: array
 *                       description: Top users by report count (for pending/reviewed reports)
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               id: 
 *                                 type: string
 *                               name: 
 *                                 type: string
 *                               email: 
 *                                 type: string
 *                           reportCount:
 *                             type: integer
 *                             example: 3
 *                     trustedSellers:
 *                       type: array
 *                       description: Placeholder - Logic needs additional model fields (e.g., sellerId, cancellation status)
 *                       items:
 *                         type: object
 *                     delinquentBorrowers:
 *                       type: array
 *                       description: Placeholder - Logic needs additional model fields (e.g., returnedAt)
 *                       items:
 *                         type: object
 *       500:
 *         description: Internal server error
 */
router.get("/", reportAdminController.getAdminReport);
router.get("/item-feedback-reports", reportAdminController.getItemFeedbackReports);


router.delete("/:id", reportAdminController.deleteReport); // ✅ Chính xác

router.get("/:reportId", reportAdminController.getReportDetail);

module.exports = router;
