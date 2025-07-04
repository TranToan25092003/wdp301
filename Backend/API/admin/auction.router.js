const express = require("express");
const { auctionAdminController } = require("../../controller");

const router = new express.Router();

/**
 * @swagger
 * /admin/auction:
 *   get:
 *     summary: Get all auctions
 *     tags:
 *        - admin/auction
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", auctionAdminController.getAllAuction);

module.exports = router;
