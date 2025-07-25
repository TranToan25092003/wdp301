const itemRouter = require("./item.duc/item.router");
const auctionRouter = require("./auction.router");
const bidRouter = require("./bid.router");
const categoryRouter = require("./category.duc/category.router");
const typeRouter = require("./type.duc/type.router");
const statusRouter = require("./status.duc/status.router");
const userRouter = require("./user.duc/user.router");
const borrowRouter = require("./borrow.duc/borrow.router");
const buyRouter = require("./buy.duc/buy.router");
const coinRouter = require("./coin.router");
const reportRouter = require("./report.duy/report.router");
const { authenticate } = require("../../middleware/guards/authen.middleware");
const testRouter = require("./test.router");const followRouter = require("./follow.duy/followRoutes");
const notificationRouter = require("./notification.duy/notificationRoutes");
const { getUsersWithPosts } = require("../../controller/user.duy/userController");
const activityLogRouter = require("./duy/activityLogRoutes");
const feedbackItemRouter = require("./user.duy/feedbackItem");
module.exports = (app) => {
  // this router only for testing app do not use this router to write data ok
  app.use("/test", authenticate, testRouter);
  // ----------------------------------------------

  app.use("/items", itemRouter);
  app.use("/categories", categoryRouter);
  app.use("/types", typeRouter);
  app.use("/statuses", statusRouter);
   app.get("/users/with-posts", getUsersWithPosts); 
  app.use("/users", userRouter);
  app.use("/borrows", borrowRouter);
  app.use("/buys", buyRouter);
  app.use("/coin", authenticate, coinRouter);
  app.use("/auctions", auctionRouter);
  app.use("/bids", bidRouter);
  app.use("/reports", reportRouter);
  app.use("/follows", followRouter);
  app.use("/notifications", notificationRouter);
  app.use("/activity-logs", activityLogRouter);
  app.use("/feedback-items", feedbackItemRouter);
 // GET /api/users/with-posts
};
