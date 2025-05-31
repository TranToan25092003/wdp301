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

module.exports = router;
