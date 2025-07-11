const express = require("express");
const { transactionAdminController } = require("../../controller");

const router = new express.Router();

/**
 * @swagger
 * /admin/transaction:
 *   get:
 *     summary: Get all contact information
 *     tags:
 *        - admin/transaction
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", transactionAdminController.getAllTransactions);

module.exports = router;
