const express = require('express');
const { getUserDetail,getUserByEmail } = require('../../../controller/user.duc/user.controller');
const router = express.Router();

router.get('/:userId', getUserDetail);
router.get('/by-email/:email', getUserByEmail);
module.exports = router;
