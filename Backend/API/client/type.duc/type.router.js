const express = require('express');
const { getAllTypes } = require('../../../controller/type.duc/type.controller');
const router = express.Router();

router.get("/", getAllTypes);

module.exports = router;
