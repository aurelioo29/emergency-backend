const { body, param, query } = require("express-validator");

const officerRoles = [
  "AMBULANCE_DRIVER",
  "PARAMEDIC",
  "FIRE_OFFICER",
  "POLICE",
];

const officerStatuses = ["AVAILABLE", "ON_DUTY", "OFFLINE"];

const createOfficerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Full name must be between 3 and 150 characters"),

  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email format is invalid"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(officerRoles)
    .withMessage(`Role must be one of: ${officerRoles.join(", ")}`),

  body("status")
    .optional()
    .isIn(officerStatuses)
    .withMessage(`Status must be one of: ${officerStatuses.join(", ")}`),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const updateOfficerValidation = [
  param("id").isUUID().withMessage("Officer id must be a valid UUID"),

  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Full name must be between 3 and 150 characters"),

  body("phoneNumber")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email format is invalid"),

  body("password")
    .optional()
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters"),

  body("role")
    .optional()
    .isIn(officerRoles)
    .withMessage(`Role must be one of: ${officerRoles.join(", ")}`),

  body("status")
    .optional()
    .isIn(officerStatuses)
    .withMessage(`Status must be one of: ${officerStatuses.join(", ")}`),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const officerIdParamValidation = [
  param("id").isUUID().withMessage("Officer id must be a valid UUID"),
];

const officerListQueryValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("role")
    .optional()
    .isIn(officerRoles)
    .withMessage(`Role must be one of: ${officerRoles.join(", ")}`),
  query("status")
    .optional()
    .isIn(officerStatuses)
    .withMessage(`Status must be one of: ${officerStatuses.join(", ")}`),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = {
  createOfficerValidation,
  updateOfficerValidation,
  officerIdParamValidation,
  officerListQueryValidation,
};
