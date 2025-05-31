const { authenticate } = require("../../middleware/guards/authen.middleware");
const { roleProtected } = require("../../middleware/guards/role.middleware");
const itemRouter = require("./item.router");

module.exports = (app) => {
  // app.use(
  //   "/admin/reviews",
  //   roleProtected,
  //   reviewRouter
  // );

  app.use("/admin/items", authenticate, roleProtected, itemRouter);
};
