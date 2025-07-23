const express = require("express");
const { clerkClient } = require("../../config/clerk");
const { PayoutRequest } = require("../../model");
const { default: mongoose } = require("mongoose");

const router = new express.Router();

const checkValidMongoId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return true;
  }

  return false;
};

const updateCoin = async (req, amount, clerkId, type) => {
  const oldCoin = Number.parseInt(req.user.publicMetadata?.coin) || 0;

  await clerkClient.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      coin: type == "minus" ? oldCoin - amount : oldCoin + amount,
    },
  });
};

/**
 * @swagger
 * /withdraw:
 *   post:
 *     summary: Create request to withdraw money
 *     tags:
 *       - withdraw money
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               cardNumber:
 *                 type: string
 *                 example: "1234-5678-9876-5432"
 *               type:
 *                 type: string
 *                 enum: [plus, minus]
 *                 example: "minus"
 *                 description: Transaction type (e.g. plus for deposit, minus for withdrawal)
 *               status:
 *                 type: string
 *                 enum: [pending, completed, rejected]
 *                 example: "pending"
 *                 description: Status of the withdrawal request
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/", async (req, res) => {
  try {
    const { amount, cardNumber, type, status } = req.body;

    await updateCoin(req, amount, req.userId, type);

    const data = await PayoutRequest.create({
      action: type,
      adminNote: "",
      amount: amount,
      cardNumber: cardNumber,
      status: status,
      customerClerkId: req.userId,
    });

    return res.json({
      data: data,
    });
  } catch (error) {
    console.error(error.message);
  }
});

/**
 * @swagger
 * /withdraw/check:
 *   get:
 *     summary: Check if user has enough coin to withdraw
 *     tags:
 *       - withdraw money
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: The amount of coins to check
 *         example: 500
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/check", async (req, res) => {
  const amount = req.query.amount;
  const user = await clerkClient.users.getUser(req.userId);

  let coin = user.publicMetadata?.coin ?? 0;
  coin = parseInt(coin);

  console.log(coin, amount);

  if (coin < amount) {
    return res.status(404).json({
      isEnoughCoin: false,
      message: "Số tiền rút vượt quá số dư",
    });
  }

  return res.status(200).json({
    isEnoughCoin: true,
    message: "enough coin",
  });
});

/**
 * @swagger
 * /withdraw/list:
 *   get:
 *     summary: get list withdraw
 *     tags:
 *       - withdraw money
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status
 *         example: pending
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/list", async (req, res) => {
  const data = await PayoutRequest.find({
    customerClerkId: req.userId,
  })
    .sort({ createdAt: -1 })
    .select("amount action createdAt");

  res.json({
    data: data,
  });
});

/**
 * @swagger
 * /withdraw/confirm/{id}:
 *   patch:
 *     summary: Update status of a withdraw request
 *     tags:
 *       - withdraw money
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the withdraw request to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 example: approved
 *                 description: New status for the withdraw request
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid ID or status
 *       404:
 *         description: Withdraw request not found
 */
router.patch("/confirm/:id", async (req, res) => {
  const id = req.params.id;

  const checkValidId = checkValidMongoId(id);

  if (!checkValidId) {
    return res.status(400).json({
      message: "id is invalid",
    });
  }

  const { status, note } = req.body;

  const updated = await PayoutRequest.findByIdAndUpdate(
    id,
    {
      status: status,
      adminNote: note,
    },
    {
      new: true,
    }
  );

  if (!updated) {
    return res.status(404).json({ message: "Payout request not found" });
  }

  return res
    .status(200)
    .json({ message: "Status updated successfully", data: updated });
});

module.exports = router;
