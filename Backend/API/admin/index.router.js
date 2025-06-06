const { authenticate } = require("../../middleware/guards/authen.middleware");
const { roleProtected } = require("../../middleware/guards/role.middleware");
const itemRouter = require("./item.router");

const contactRouter = require("./contact.router");

module.exports = (app) => {
  app.use("/admin/items", authenticate, roleProtected, itemRouter);

  app.use("/admin/contact", authenticate, roleProtected, contactRouter);
};
