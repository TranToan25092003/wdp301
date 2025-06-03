const { query } = require("express-validator");

const validateFilterItems = [
    query("name").optional().isString().withMessage("Name must be a string"),
    query("minPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("minPrice must be a positive number"),
    query("maxPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("maxPrice must be a positive number"),
    query("ratePrice")
        .optional()
        .isIn(["hour", "day", "no"])
        .withMessage('ratePrice must be "hour", "day" or "no"'),
    query("owner").optional().isString().withMessage("Owner must be a string"),
    query("typeId")
        .optional()
        .isMongoId()
        .withMessage("typeId must be a valid MongoDB ObjectId"),
    query("categoryId")
        .optional()
        .isMongoId()
        .withMessage("categoryId must be a valid MongoDB ObjectId"),
    query("statusId")
        .optional()
        .isMongoId()
        .withMessage("statusId must be a valid MongoDB ObjectId"),
    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("startDate must be a valid ISO date"),
    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("endDate must be a valid ISO date"),
];

module.exports = validateFilterItems;
