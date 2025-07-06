const express = require("express");
const validateBorrow = require("../../../dto/borrow.dto");
const {
  createBorrow,
  getAllBorrowRecordByUserId,
  requestForReturnBorrow,
} = require("../../../controller/borrow.duc/borrow.controller");
const {
  authenticate,
} = require("../../../middleware/guards/authen.middleware");
const { validationResult } = require("express-validator");
const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  return getAllBorrowRecordByUserId(req, res, next);
});

router.post("/", authenticate, validateBorrow, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  return createBorrow(req, res, next);
});

router.post("/request-return", authenticate, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  return requestForReturnBorrow(req, res, next);
});

module.exports = router;
