const express = require('express');
const { getAllItems } = require('../../../controller/item.duc/item.controller');
const router = express.Router();

router.get('/', getAllItems);

module.exports = router;
