const express = require("express");
const { coinController } = require("../../controller");
const router = new express.Router();

/**
 * @swagger
 * /coin/secret:
 *   post:
 *     summary: API get secret coin
 *     tags:
 *        - Coin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/secret", coinController.secret);

/**
 * @swagger
 * /coin/confirm:
 *   get:
 *     summary: API to confirm payment
 *     tags:
 *        - Coin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Session id to confirm payment
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/confirm", coinController.confirm);

module.exports = router;
