const { body } = require("express-validator");

const contactValidation = [
  body("address").notEmpty().withMessage("Address is required"),

  body("phone")
    .matches(/^\+?\d{10,15}$/)
    .withMessage("Invalid phone number"),

  body("email").isEmail().withMessage("Invalid email address"),

  body("facebook")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error("Invalid Facebook URL");
      }
    }),

  body("zalo")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error("Invalid Zalo URL");
      }
    }),

  body("iframe")
    .optional({ nullable: true })
    .isString()
    .withMessage("Iframe must be a string"),
];

module.exports = contactValidation;
