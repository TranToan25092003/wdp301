const testRouter = require("./test.router");
const itemRouter = require("./item.duc/item.router")
const categoryRouter = require("./category.duc/category.router")
const userRouter = require("./user.duc/user.router")
const borrowRouter = require("./borrow.duc/borrow.router")
const { authenticate } = require("../../middleware/guards/authen.middleware");
const { clerkMiddleware, requireAuth, getAuth } = require("@clerk/express");
const { roleProtected } = require("../../middleware/guards/role.middleware");

module.exports = (app) => {
  // this router only for testing app do not use this router to write data ok
  app.use("/test", authenticate, testRouter);
  app.use("/items", itemRouter);
  app.use("/categories", categoryRouter)
  app.use("/users", userRouter)
  app.use("/borrows", borrowRouter)
  // -------------------------------
};
