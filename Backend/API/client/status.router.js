const express = require("express");
const { getAllStatuses } = require("../../controller/status.controller");
const router = express.Router();

router.get("/", getAllStatuses);

module.exports = router;
