const express = require('express');
const { getUserDetail } = require('../../../controller/user.duc/user.controller');
const router = express.Router();

router.get('/:userId', getUserDetail);

module.exports = router;
