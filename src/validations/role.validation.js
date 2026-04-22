const { body, query, param } = require("express-validator");

const createRoleValidation = [
  body("roleCode")
    .notEmpty()
    .withMessage("roleCode is required")
    .isString()
    .withMessage("roleCode must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("roleCode must be between 2 and 50 characters"),

  body("roleName")
    .notEmpty()
    .withMessage("roleName is required")
    .isString()
    .withMessage("roleName must be a string")
    .isLength({ min: 2, max: 150 })
    .withMessage("roleName must be between 2 and 150 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("description must be a string"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const updateRoleValidation = [
  param("id").isUUID().withMessage("Role id must be a valid UUID"),

  body("roleCode")
    .optional()
    .isString()
    .withMessage("roleCode must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("roleCode must be between 2 and 50 characters"),

  body("roleName")
    .optional()
    .isString()
    .withMessage("roleName must be a string")
    .isLength({ min: 2, max: 150 })
    .withMessage("roleName must be between 2 and 150 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("description must be a string"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const roleIdParamValidation = [
  param("id").isUUID().withMessage("Role id must be a valid UUID"),
];

const allRolesQueryValidation = [
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

  query("search").optional().isString().withMessage("search must be a string"),
];

const toggleRoleActiveValidation = [
  param("id").isUUID().withMessage("Role id must be a valid UUID"),

  body("isActive")
    .notEmpty()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

module.exports = {
  createRoleValidation,
  updateRoleValidation,
  roleIdParamValidation,
  allRolesQueryValidation,
  toggleRoleActiveValidation,
};
