const express = require("express");
const { itemController } = require("../../controller");
const router = new express.Router();

/**
 * @swagger
 * /admin/items:
 *   get:
 *     summary: Get all items admin
 *     tags:
 *        - admin/items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
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

module.exports = router;
