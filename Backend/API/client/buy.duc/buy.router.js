const express = require('express');
const { authenticate } = require('../../../middleware/guards/authen.middleware');
const { validationResult } = require('express-validator');
const { purchaseItem } = require('../../../controller/buy.duc/buy.controller');
const router = express.Router();

router.post("/", authenticate, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    return purchaseItem(req, res, next);
});

module.exports = router;
