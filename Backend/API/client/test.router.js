const express = require("express");
const router = new express.Router();
const controller = require("../../controller/test.controller");
// const { clerkClient } = require("../../config/clerk");

/**
 * @swagger
 * /test:
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
router.get("/", controller.checkHealth);

// router.post("/card", async (req, res) => {
//   const { cardNumber } = req.body;

//   const userId = req.auth.userId;

//   console.log(req.auth.userId);

//   try {
//     await clerkClient.users.updateUserMetadata(userId, {
//       publicMetadata: {
//         cardNumber,
//       },
//     });
//     res.status(200).json({
//       message: "success",
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

module.exports = router;
