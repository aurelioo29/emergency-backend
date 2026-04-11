const { body, param } = require("express-validator");

const updateMyProfileValidation = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Full name must be between 3 and 150 characters"),

  body("phoneNumber")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Address must be between 5 and 1000 characters"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8, max: 100 })
    .withMessage("New password must be between 8 and 100 characters"),
];

const createEmergencyContactValidation = [
  body("contactName")
    .trim()
    .notEmpty()
    .withMessage("Contact name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Contact name must be between 2 and 150 characters"),

  body("contactPhone")
    .trim()
    .notEmpty()
    .withMessage("Contact phone is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Contact phone must be between 8 and 20 characters"),

  body("relation")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Relation must be between 2 and 100 characters"),
];

const updateEmergencyContactValidation = [
  param("id").isUUID().withMessage("Emergency contact id must be a valid UUID"),

  body("contactName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Contact name must be between 2 and 150 characters"),

  body("contactPhone")
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Contact phone must be between 8 and 20 characters"),

  body("relation")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Relation must be between 2 and 100 characters"),
];

const emergencyContactIdParamValidation = [
  param("id").isUUID().withMessage("Emergency contact id must be a valid UUID"),
];

const createDiseaseHistoryValidation = [
  body("diseaseName")
    .trim()
    .notEmpty()
    .withMessage("Disease name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Disease name must be between 2 and 150 characters"),

  body("notes")
    .optional({ nullable: true })
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

const updateDiseaseHistoryValidation = [
  param("id").isUUID().withMessage("Disease history id must be a valid UUID"),

  body("diseaseName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Disease name must be between 2 and 150 characters"),

  body("notes")
    .optional({ nullable: true })
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

const diseaseHistoryIdParamValidation = [
  param("id").isUUID().withMessage("Disease history id must be a valid UUID"),
];

module.exports = {
  updateMyProfileValidation,
  changePasswordValidation,
  createEmergencyContactValidation,
  updateEmergencyContactValidation,
  emergencyContactIdParamValidation,
  createDiseaseHistoryValidation,
  updateDiseaseHistoryValidation,
  diseaseHistoryIdParamValidation,
};
