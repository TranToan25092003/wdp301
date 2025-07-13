const express = require("express");
const router = new express.Router();
const controller = require("../../controller/huynt.controller/bid.controller");
const { clerkClient } = require("../../config/clerk");
const { authenticate } = require("../../middleware/guards/authen.middleware");

router.post("/", authenticate, controller.placeBid);

module.exports = router;
