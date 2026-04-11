const { body, query, param } = require("express-validator");

const dispatchStatuses = [
  "ASSIGNED",
  "ACCEPTED",
  "ON_THE_WAY",
  "ARRIVED",
  "COMPLETED",
  "CANCELLED",
];

const createDispatchValidation = [
  body("reportId")
    .notEmpty()
    .withMessage("reportId is required")
    .isUUID()
    .withMessage("reportId must be a valid UUID"),

  body("officerId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("officerId must be a valid UUID"),

  body("ambulanceId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("ambulanceId must be a valid UUID"),

  body("notes")
    .optional({ nullable: true })
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

const allDispatchesQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("dispatchStatus")
    .optional()
    .isIn(dispatchStatuses)
    .withMessage(
      `Dispatch status must be one of: ${dispatchStatuses.join(", ")}`,
    ),

  query("reportId")
    .optional()
    .isUUID()
    .withMessage("reportId must be a valid UUID"),

  query("officerId")
    .optional()
    .isUUID()
    .withMessage("officerId must be a valid UUID"),

  query("ambulanceId")
    .optional()
    .isUUID()
    .withMessage("ambulanceId must be a valid UUID"),
];

const dispatchIdParamValidation = [
  param("id").isUUID().withMessage("Dispatch id must be a valid UUID"),
];

const dispatchReportIdParamValidation = [
  param("reportId").isUUID().withMessage("Report id must be a valid UUID"),
];

const updateDispatchStatusValidation = [
  param("id").isUUID().withMessage("Dispatch id must be a valid UUID"),

  body("dispatchStatus")
    .notEmpty()
    .withMessage("dispatchStatus is required")
    .isIn(dispatchStatuses)
    .withMessage(
      `Dispatch status must be one of: ${dispatchStatuses.join(", ")}`,
    ),

  body("notes")
    .optional({ nullable: true })
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

const completeDispatchValidation = [
  param("id").isUUID().withMessage("Dispatch id must be a valid UUID"),

  body("notes")
    .optional({ nullable: true })
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

module.exports = {
  createDispatchValidation,
  allDispatchesQueryValidation,
  dispatchIdParamValidation,
  dispatchReportIdParamValidation,
  updateDispatchStatusValidation,
  completeDispatchValidation,
};
