const { authenticate } = require("../../middleware/guards/authen.middleware");
const { roleProtected } = require("../../middleware/guards/role.middleware");
const itemRouter = require("./item.router");
const userAdminRouter = require("./userAdmin.router");
const contactRouter = require("./contact.router");
const reportRouter = require("./report.router");
const statsRouter = require("./stats.router");
const auctionRouter = require("./auction.router");
const transactionRouter = require("./transaction.router");

module.exports = (app) => {
  app.use("/admin/items", authenticate, roleProtected, itemRouter);

  app.use("/admin/contact", contactRouter);

  app.use("/admin/reports", authenticate, roleProtected, reportRouter);
  app.use("/admin/stats", authenticate, roleProtected, statsRouter);
  app.use("/admin/users", authenticate, roleProtected, userAdminRouter);
  app.use("/admin/auction", authenticate, roleProtected, auctionRouter);
  app.use("/admin/transaction", authenticate, roleProtected, transactionRouter);
};
