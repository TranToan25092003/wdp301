const express = require("express");
const router = express.Router();
const { getValidFeedbackItems } = require("../../../controller/user.duy/feedbackItemController");

router.get(
  "/valid-for-feedback/:sellerClerkId/:currentUserId",
  getValidFeedbackItems
);

module.exports = router;