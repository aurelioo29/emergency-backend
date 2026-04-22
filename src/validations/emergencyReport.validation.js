const { body, query, param } = require("express-validator");

const emergencyTypes = ["SOS", "AMBULANCE", "FIRE", "CRIME"];
const reportStatuses = [
  "REPORTED",
  "ASSIGNED",
  "ACCEPTED",
  "ON_THE_WAY",
  "ARRIVED",
  "HANDLING",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
];

const createEmergencyReportValidation = [
  body("serviceId")
    .notEmpty()
    .withMessage("serviceId is required")
    .isUUID()
    .withMessage("serviceId must be a valid UUID"),

  body("emergencyType")
    .optional()
    .isIn(emergencyTypes)
    .withMessage("Emergency type is invalid"),

  body("description")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Description must be at least 3 characters"),

  body("latitude")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat()
    .withMessage("Latitude must be a valid number"),

  body("longitude")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat()
    .withMessage("Longitude must be a valid number"),

  body("addressSnapshot")
    .optional()
    .isString()
    .withMessage("Address snapshot must be a string"),

  body("photoCapturedAt")
    .optional()
    .isISO8601()
    .withMessage("Photo captured time must be a valid ISO date"),
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

  query("serviceId")
    .optional()
    .isUUID()
    .withMessage("serviceId must be a valid UUID"),
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

  query("serviceId")
    .optional()
    .isUUID()
    .withMessage("serviceId must be a valid UUID"),

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
