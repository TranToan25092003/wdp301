const itemController = require("./admin/item.controller");
const coinController = require("./coin.controller");
const contactController = require("./admin/contact.controller");
const reportAdminController = require("./admin/reportAdminController");
const adminStatsController = require("./admin/adminStatsController");
const userAdminController = require("./admin/userAdminController"); // Import user admin controller
const auctionAdminController = require("./admin/auction.controller");
const transactionAdminController = require("./admin/transaction.controller");

module.exports = {
  itemController,
  coinController,
  contactController,
  reportAdminController, // THÊM DÒNG NÀY VÀO ĐÂY
  adminStatsController,
  userAdminController,
  auctionAdminController,
  transactionAdminController,
};
