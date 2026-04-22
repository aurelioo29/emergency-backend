const { body, query, param } = require("express-validator");

const autoAcceptModes = ["FULL_AUTO", "CONFIRM", "MANUAL"];

const createServiceValidation = [
  body("serviceCode")
    .notEmpty()
    .withMessage("serviceCode is required")
    .isString()
    .withMessage("serviceCode must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("serviceCode must be between 2 and 50 characters"),

  body("serviceName")
    .notEmpty()
    .withMessage("serviceName is required")
    .isString()
    .withMessage("serviceName must be a string")
    .isLength({ min: 2, max: 150 })
    .withMessage("serviceName must be between 2 and 150 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("description must be a string"),

  body("iconName")
    .optional({ nullable: true })
    .isString()
    .withMessage("iconName must be a string")
    .isLength({ max: 100 })
    .withMessage("iconName must not exceed 100 characters"),

  body("colorHex")
    .optional({ nullable: true })
    .isString()
    .withMessage("colorHex must be a string")
    .isLength({ max: 20 })
    .withMessage("colorHex must not exceed 20 characters"),

  body("requiresDispatch")
    .optional()
    .isBoolean()
    .withMessage("requiresDispatch must be a boolean"),

  body("autoAcceptMode")
    .optional()
    .isIn(autoAcceptModes)
    .withMessage(
      `autoAcceptMode must be one of: ${autoAcceptModes.join(", ")}`,
    ),

  body("acceptTimeoutSeconds")
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage("acceptTimeoutSeconds must be between 0 and 3600"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const updateServiceValidation = [
  param("id").isUUID().withMessage("Service id must be a valid UUID"),

  body("serviceCode")
    .optional()
    .isString()
    .withMessage("serviceCode must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("serviceCode must be between 2 and 50 characters"),

  body("serviceName")
    .optional()
    .isString()
    .withMessage("serviceName must be a string")
    .isLength({ min: 2, max: 150 })
    .withMessage("serviceName must be between 2 and 150 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("description must be a string"),

  body("iconName")
    .optional({ nullable: true })
    .isString()
    .withMessage("iconName must be a string")
    .isLength({ max: 100 })
    .withMessage("iconName must not exceed 100 characters"),

  body("colorHex")
    .optional({ nullable: true })
    .isString()
    .withMessage("colorHex must be a string")
    .isLength({ max: 20 })
    .withMessage("colorHex must not exceed 20 characters"),

  body("requiresDispatch")
    .optional()
    .isBoolean()
    .withMessage("requiresDispatch must be a boolean"),

  body("autoAcceptMode")
    .optional()
    .isIn(autoAcceptModes)
    .withMessage(
      `autoAcceptMode must be one of: ${autoAcceptModes.join(", ")}`,
    ),

  body("acceptTimeoutSeconds")
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage("acceptTimeoutSeconds must be between 0 and 3600"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const serviceIdParamValidation = [
  param("id").isUUID().withMessage("Service id must be a valid UUID"),
];

const allServicesQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .isLength({ max: 100 })
    .withMessage("Search must not exceed 100 characters"),
];

const toggleServiceActiveValidation = [
  param("id").isUUID().withMessage("Service id must be a valid UUID"),
  body("isActive")
    .notEmpty()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = {
  createServiceValidation,
  updateServiceValidation,
  serviceIdParamValidation,
  allServicesQueryValidation,
  toggleServiceActiveValidation,
};
