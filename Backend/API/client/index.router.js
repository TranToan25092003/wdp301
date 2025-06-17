const itemRouter = require("./item.duc/item.router");
const auctionRouter = require("./auction.router");
const bidRouter = require("./bid.router");
const categoryRouter = require("./category.duc/category.router");
const userRouter = require("./user.duc/user.router");
const borrowRouter = require("./borrow.duc/borrow.router");
const coinRouter = require("./coin.router");
const typeRouter = require("./type.router");
const statusRouter = require("./status.router");
const { authenticate } = require("../../middleware/guards/authen.middleware");

module.exports = (app) => {
  // -------------------------------

  app.use("/items", itemRouter);
  app.use("/categories", categoryRouter);
  app.use("/users", userRouter);
  app.use("/borrows", borrowRouter);
  app.use("/coin", authenticate, coinRouter);
  app.use("/auctions", auctionRouter);
  app.use("/bids", bidRouter);
  app.use("/types", typeRouter);
  app.use("/statuses", statusRouter);
};
