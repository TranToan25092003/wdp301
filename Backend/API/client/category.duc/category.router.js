const express = require('express');
const { getAllCategoriesWithStats } = require('../../../controller/category.duc/category.controller');
const router = express.Router();

router.get("/", getAllCategoriesWithStats);

module.exports = router;
