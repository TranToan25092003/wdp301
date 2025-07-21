const express = require("express");
const { stripe } = require("../../config/stripe");
const router = new express.Router();

/**
 * @swagger
 * /withdraw:
 *   get:
 *     summary: API test trực tiếp từ app
 *     tags:
 *        - Test
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", async (req, res) => {
  //   console.log(req.userId);
  const data = {
    userId: "test_user_12345", // Mã định danh người dùng giả
    coinAmount: 1000, // Số coin muốn rút (giả định 100 coin = 100.000 VND hoặc 100 USD trong test)
    bankAccount: {
      accountNumber: "000123456789", // Số tài khoản ngân hàng giả của Stripe (test mode)
      accountHolderName: "Test User", // Tên chủ tài khoản giả
      bankName: "Test Bank", // Tên ngân hàng giả (tùy chọn)
      country: "US", // Quốc gia test (Stripe yêu cầu US cho tài khoản ngân hàng giả)
      currency: "usd", // Tiền tệ test (VND không được hỗ trợ trong test mode)
      routingNumber: "110000000", // Mã routing giả (bắt buộc cho US)
    },
  };

  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: `test${"11111"}@example.com`,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  let stripeAccountId = account.id;

  console.log(stripeAccountId);

  return res.json({
    message: "hello",
  });
});

module.exports = router;
