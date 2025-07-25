const express = require("express");
const { itemController } = require("../../controller");
const router = new express.Router();

/**
 * @swagger
 * /admin/items:
 *   get:
 *     summary: Get all items for admin with pagination and optional status filtering
 *     tags:
 *       - admin/items
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter items by status name (optional)
 *     responses:
 *       200:
 *         description: Successful response with paginated items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Item ID
 *                       name:
 *                         type: string
 *                         description: Item name
 *                       price:
 *                         type: number
 *                         description: Item price
 *                       image:
 *                         type: string
 *                         description: URL of the first item image
 *                       type:
 *                         type: string
 *                         description: Item type name
 *                       status:
 *                         type: string
 *                         description: Item status name
 *                       category:
 *                         type: string
 *                         description: Item category name
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *       400:
 *         description: Invalid status filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid status filter
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error in getting items
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get("/", itemController.getAllItems);

/**
 * @swagger
 * /admin/items/browse:
 *   get:
 *     summary: Get all items need to browse
 *     tags:
 *        - admin/items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/browse", itemController.getBrowseItem);

/**
 * @swagger
 * /admin/items/approve:
 *   post:
 *     summary: Approve an item in system
 *     tags:
 *       - admin/items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 example: "abc123"
 *               approved:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/approve", itemController.approveItem);

/**
 * @swagger
 * /admin/items/{id}/detail:
 *   get:
 *     summary: Get item by ID
 *     tags:
 *       - admin/items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the item
 *       404:
 *         description: Item not found
 */
router.get("/:id/detail", itemController.getItemById);

/**
 * @swagger
 * /admin/items/{id}/approve-edit:
 *   post:
 *     summary: Approve an edit request for an item
 *     tags:
 *       - admin/items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item with the edit request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminId:
 *                 type: string
 *                 example: "admin_xyz"
 *     responses:
 *       200:
 *         description: Edit request approved successfully
 *       400:
 *         description: Invalid request or no pending edit request
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.post("/:id/approve-edit", itemController.approveEditRequest);

/**
 * @swagger
 * /admin/items/{id}/reject-edit:
 *   post:
 *     summary: Reject an edit request for an item
 *     tags:
 *       - admin/items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item with the edit request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminId:
 *                 type: string
 *                 example: "admin_xyz"
 *               rejectReason:
 *                 type: string
 *                 example: "Inappropriate content"
 *     responses:
 *       200:
 *         description: Edit request rejected successfully
 *       400:
 *         description: Invalid request or no pending edit request
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.post("/:id/reject-edit", itemController.rejectEditRequest);

module.exports = router;
