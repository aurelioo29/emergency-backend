const { body, param } = require("express-validator");

const updateOfficerLocationValidation = [
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

  body("reportId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("reportId must be a valid UUID"),
];

const reportIdParamValidation = [
  param("reportId").isUUID().withMessage("Report id must be a valid UUID"),
];

module.exports = {
  updateOfficerLocationValidation,
  reportIdParamValidation,
};
