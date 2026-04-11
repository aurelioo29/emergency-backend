const { body, query, param } = require("express-validator");

const emergencyTypes = ["SOS", "AMBULANCE", "FIRE", "CRIME"];
const reportStatuses = [
  "REPORTED",
  "ASSIGNED",
  "ON_THE_WAY",
  "ARRIVED",
  "HANDLING",
  "COMPLETED",
  "CANCELLED",
];

const createEmergencyReportValidation = [
  body("emergencyType")
    .notEmpty()
    .withMessage("Emergency type is required")
    .isIn(emergencyTypes)
    .withMessage(`Emergency type must be one of: ${emergencyTypes.join(", ")}`),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("latitude")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid number between -90 and 90"),

  body("longitude")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid number between -180 and 180"),

  body("addressSnapshot")
    .optional({ nullable: true })
    .isString()
    .withMessage("Address snapshot must be a string")
    .isLength({ max: 1000 })
    .withMessage("Address snapshot must not exceed 1000 characters"),
];

const emergencyReportIdParamValidation = [
  param("id").isUUID().withMessage("Emergency report id must be a valid UUID"),
];

const myReportsQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(reportStatuses)
    .withMessage(`Status must be one of: ${reportStatuses.join(", ")}`),

  query("emergencyType")
    .optional()
    .isIn(emergencyTypes)
    .withMessage(`Emergency type must be one of: ${emergencyTypes.join(", ")}`),
];

const allReportsQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(reportStatuses)
    .withMessage(`Status must be one of: ${reportStatuses.join(", ")}`),

  query("emergencyType")
    .optional()
    .isIn(emergencyTypes)
    .withMessage(`Emergency type must be one of: ${emergencyTypes.join(", ")}`),

  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .isLength({ max: 100 })
    .withMessage("Search must not exceed 100 characters"),
];

const updateEmergencyReportStatusValidation = [
  param("id").isUUID().withMessage("Emergency report id must be a valid UUID"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(reportStatuses)
    .withMessage(`Status must be one of: ${reportStatuses.join(", ")}`),

  body("notes")
    .optional({ nullable: true })
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

module.exports = {
  createEmergencyReportValidation,
  emergencyReportIdParamValidation,
  myReportsQueryValidation,
  allReportsQueryValidation,
  updateEmergencyReportStatusValidation,
};
