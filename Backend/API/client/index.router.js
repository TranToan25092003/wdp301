const testRouter = require("./test.router");
const itemRouter = require("./item.duc/item.router")
const { authenticate } = require("../../middleware/guards/authen.middleware");
const { clerkMiddleware, requireAuth, getAuth } = require("@clerk/express");
const { roleProtected } = require("../../middleware/guards/role.middleware");

module.exports = (app) => {
  // this router only for testing app do not use this router to write data ok
  app.use("/test", authenticate, testRouter);
  app.use("/items", itemRouter);
  // -------------------------------
};
