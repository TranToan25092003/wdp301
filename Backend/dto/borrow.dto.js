const { body } = require("express-validator");

const validateBorrow = [
  body("totalPrice")
    .isFloat({ min: 1 })
    .withMessage("Total price must be a positive number")
    .notEmpty()
    .withMessage("Total price is required"),

  body("totalTime")
    .isInt({ min: 1 })
    .withMessage("Total time must be a positive integer")
    .notEmpty()
    .withMessage("Total time is required"),

  body("borrowers")
    .isString()
    .withMessage("Borrower must be a string")
    .notEmpty()
    .withMessage("Borrower is required"),

  body("itemId")
    .isMongoId()
    .withMessage("Item ID must be a valid MongoDB ObjectId")
    .notEmpty()
    .withMessage("Item ID is required"),

  body("startTime")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 datetime string")
    .notEmpty()
    .withMessage("Start time is required"),

  body("endTime")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 datetime string")
    .notEmpty()
    .withMessage("End time is required")
    .custom((value, { req }) => {
      const start = new Date(req.body.startTime);
      const end = new Date(value);
      if (end <= start) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),
];

module.exports = validateBorrow;
