const { body, param, query } = require("express-validator");

const ambulanceStatuses = ["AVAILABLE", "DISPATCHED", "MAINTENANCE"];

const createAmbulanceValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Code is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Code must be between 3 and 50 characters"),

  body("plateNumber")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Plate number must be between 3 and 30 characters"),

  body("currentLatitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Current latitude must be between -90 and 90"),

  body("currentLongitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Current longitude must be between -180 and 180"),

  body("status")
    .optional()
    .isIn(ambulanceStatuses)
    .withMessage(`Status must be one of: ${ambulanceStatuses.join(", ")}`),
];

const updateAmbulanceValidation = [
  param("id").isUUID().withMessage("Ambulance id must be a valid UUID"),

  body("code")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Code must be between 3 and 50 characters"),

  body("plateNumber")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Plate number must be between 3 and 30 characters"),

  body("currentLatitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Current latitude must be between -90 and 90"),

  body("currentLongitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Current longitude must be between -180 and 180"),

  body("status")
    .optional()
    .isIn(ambulanceStatuses)
    .withMessage(`Status must be one of: ${ambulanceStatuses.join(", ")}`),
];

const ambulanceIdParamValidation = [
  param("id").isUUID().withMessage("Ambulance id must be a valid UUID"),
];

const ambulanceListQueryValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("status")
    .optional()
    .isIn(ambulanceStatuses)
    .withMessage(`Status must be one of: ${ambulanceStatuses.join(", ")}`),
];

module.exports = {
  createAmbulanceValidation,
  updateAmbulanceValidation,
  ambulanceIdParamValidation,
  ambulanceListQueryValidation,
};
