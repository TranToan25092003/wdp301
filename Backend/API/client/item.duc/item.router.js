const express = require("express");
const {
  getAllItems,
  getItemsByCategory,
  getRecentItemsByCategory,
  getItemDetailById,
} = require("../../../controller/item.duc/item.controller");
const router = express.Router();

router.get("/", getAllItems);
router.get("/:itemId", getItemDetailById);
router.get("/category/:categoryId", getItemsByCategory);
router.get("/category/:categoryId/recent", getRecentItemsByCategory);

module.exports = router;
