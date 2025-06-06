const express = require("express");
const router = new express.Router();
const controller = require("../../controller/huynt.controller/auction.controller");

router.get("/", controller.getAllAuctions);

router.post("/create", controller.createAuction);

router.get("/auction/:id", controller.getAuctionDetails);

router.delete("/delete/:id", controller.deleteAuction);

module.exports = router;
