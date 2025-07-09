const express = require('express');
const { authenticate } = require('../../../middleware/guards/authen.middleware');
const { validationResult } = require('express-validator');
const { purchaseItem, getAllBuyRecordByUserId } = require('../../../controller/buy.duc/buy.controller');
const { checkBanStatus } = require("../../../middleware/ban.middleware");
const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    return getAllBuyRecordByUserId(req, res, next);
});

router.post("/", authenticate, checkBanStatus,async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    return purchaseItem(req, res, next);
});

module.exports = router;
