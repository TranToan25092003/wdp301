const { body } = require("express-validator");

const validateActivityLog = [
  body("action")
    .isString()
    .withMessage("Action must be a string")
    .notEmpty()
    .withMessage("Action cannot be empty"),
  body("details").isString().withMessage("Details must be a string").optional(),
];

module.exports = validateActivityLog;
