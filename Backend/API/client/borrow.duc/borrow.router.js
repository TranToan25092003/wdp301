const express = require('express');
const validateBorrow = require('../../../dto/borrow.dto');
const { createBorrow } = require('../../../controller/borrow.duc/borrow.controller');
const { authenticate } = require('../../../middleware/guards/authen.middleware');
const { validationResult } = require('express-validator');
const router = express.Router();

router.post("/", authenticate, validateBorrow, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    // ✅ Đảm bảo return để tránh chạy tiếp sau khi xử lý xong
    return createBorrow(req, res, next);
});

module.exports = router;
