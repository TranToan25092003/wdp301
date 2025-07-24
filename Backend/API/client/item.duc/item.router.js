const express = require("express");
const {
  getAllItems,
  getItemsByCategory,
  getRecentItemsByCategory,
  getItemDetailById,
  getRecentItems,
  filterItems,
  createItem,
  getUserUploadedItems,
  getItemsByOwner,
  submitItemEditRequest,
  confirmItemDelivery,
  confirmItemReceipt,
} = require("../../../controller/item.duc/item.controller");
const validateFilterItems = require("../../../dto/item.dto");
const { validationResult } = require("express-validator");
const router = express.Router();

const { checkSpamContent } = require("../../../middleware/spamContentChecker");
const { createItemLimiter } = require("../../../middleware/rateLimiters");
const {
  authenticate,
} = require("../../../middleware/guards/authen.middleware");
const { checkBanStatus } = require("../../../middleware/ban.middleware"); // <-- IMPORT DÒNG NÀY

router.get("/", getAllItems);
router.get("/recent", getRecentItems);
router.get("/by-owner/:ownerId", getItemsByOwner);
router.post(
  "/",
  authenticate,
  checkBanStatus,
  createItemLimiter,
  checkSpamContent("name", "spam_content"),
  checkSpamContent("description", "spam_content"),
  createItem
);

router.get(
  "/filter",
  validateFilterItems,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  filterItems
);
router.get("/uploaded", authenticate, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  return getUserUploadedItems(req, res, next);
});
router.get("/:itemId", getItemDetailById);
router.get("/category/:categoryId", getItemsByCategory);
router.get("/category/:categoryId/recent", getRecentItemsByCategory);

router.post(
  "/:itemId/edit-request",
  authenticate,
  checkBanStatus,
  checkSpamContent("name", "item_name_spam"),
  checkSpamContent("description", "item_description_spam"),
  submitItemEditRequest
);

// Add new route for seller to confirm delivery
router.post(
  "/confirm-delivery/:itemId",
  authenticate,
  checkBanStatus,
  confirmItemDelivery
);

// Add new route for buyer to confirm receipt
router.post(
  "/confirm-receipt/:itemId",
  authenticate,
  checkBanStatus,
  confirmItemReceipt
);

module.exports = router;
