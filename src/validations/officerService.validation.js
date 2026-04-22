const { body, query, param } = require("express-validator");

const createOfficerServiceValidation = [
  body("officerId")
    .notEmpty()
    .withMessage("officerId is required")
    .isUUID()
    .withMessage("officerId must be a valid UUID"),

  body("serviceId")
    .notEmpty()
    .withMessage("serviceId is required")
    .isUUID()
    .withMessage("serviceId must be a valid UUID"),

  body("isPrimary")
    .optional()
    .isBoolean()
    .withMessage("isPrimary must be a boolean"),
];

const updateOfficerServiceValidation = [
  param("id").isUUID().withMessage("Officer service id must be a valid UUID"),

  body("isPrimary")
    .optional()
    .isBoolean()
    .withMessage("isPrimary must be a boolean"),
];

const officerServiceIdParamValidation = [
  param("id").isUUID().withMessage("Officer service id must be a valid UUID"),
];

const officerIdParamValidation = [
  param("officerId").isUUID().withMessage("Officer id must be a valid UUID"),
];

const allOfficerServicesQueryValidation = [
  query("officerId")
    .optional()
    .isUUID()
    .withMessage("officerId must be a valid UUID"),

  query("serviceId")
    .optional()
    .isUUID()
    .withMessage("serviceId must be a valid UUID"),
];

module.exports = {
  createOfficerServiceValidation,
  updateOfficerServiceValidation,
  officerServiceIdParamValidation,
  officerIdParamValidation,
  allOfficerServicesQueryValidation,
};
