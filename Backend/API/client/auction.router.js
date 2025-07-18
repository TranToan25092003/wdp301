const express = require("express");
const router = new express.Router();
const controller = require("../../controller/huynt.controller/auction.controller");
const { authenticate } = require("../../middleware/guards/authen.middleware");

router.get("/", controller.getAllAuctions);

router.post("/create", authenticate, controller.createAuction);

router.get("/auction/:id", controller.getAuctionDetails);

router.get("/:id", controller.getAuctionById);

router.put("/:id", authenticate, controller.updateAuction);

router.delete("/delete/:id", authenticate, controller.deleteAuction);

module.exports = router;
