const express = require('express');
const { getAllItems, getItemsByCategory, getRecentItemsByCategory, getItemDetailById, getRecentItems, filterItems } = require('../../../controller/item.duc/item.controller');
const validateFilterItems = require('../../../dto/item.dto');
const { validationResult } = require('express-validator');
const router = express.Router();

router.get("/", getAllItems);
router.get("/recent", getRecentItems);
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
router.get("/:itemId", getItemDetailById)
router.get("/category/:categoryId", getItemsByCategory)
router.get("/category/:categoryId/recent", getRecentItemsByCategory)


module.exports = router;
