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

/**
 * @swagger
 * /admin/auction/{id}:
 *   get:
 *     summary: Get auction detail by ID
 *     tags:
 *       - admin/auction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the auction
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/:id", auctionAdminController.getAnAuction);

module.exports = router;
