const express = require("express");
const router = new express.Router();
const controller = require("../../controller/huynt.controller/bid.controller");
const { clerkClient } = require("../../config/clerk");

router.post("/", controller.placeBid);

module.exports = router;
