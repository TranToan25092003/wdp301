const express = require("express");
const { categoryAdminController } = require("../../controller");

const router = new express.Router();

/**
 * @swagger
 * /admin/category:
 *   get:
 *     summary: Get all category
 *     tags:
 *        - admin/category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", categoryAdminController.getAllCategory);

module.exports = router;
