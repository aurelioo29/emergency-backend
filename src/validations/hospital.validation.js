const { body, param, query } = require("express-validator");

const createHospitalValidation = [
  body("hospitalName")
    .trim()
    .notEmpty()
    .withMessage("Hospital name is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Hospital name must be between 3 and 150 characters"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Address must be between 5 and 1000 characters"),

  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("Phone number must be between 6 and 20 characters"),

  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const updateHospitalValidation = [
  param("id").isUUID().withMessage("Hospital id must be a valid UUID"),

  body("hospitalName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Hospital name must be between 3 and 150 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Address must be between 5 and 1000 characters"),

  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("Phone number must be between 6 and 20 characters"),

  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const hospitalIdParamValidation = [
  param("id").isUUID().withMessage("Hospital id must be a valid UUID"),
];

const hospitalListQueryValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = {
  createHospitalValidation,
  updateHospitalValidation,
  hospitalIdParamValidation,
  hospitalListQueryValidation,
};
