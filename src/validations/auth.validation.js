const { body } = require("express-validator");

const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Full name must be between 3 and 150 characters"),

  body("nik")
    .trim()
    .notEmpty()
    .withMessage("NIK is required")
    .isLength({ min: 8, max: 30 })
    .withMessage("NIK must be between 8 and 30 characters"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 characters"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5 })
    .withMessage("Address must be at least 5 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters"),
];

const loginUserValidation = [
  body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

const loginAdminValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email format is invalid"),

  body("password").notEmpty().withMessage("Password is required"),
];

const loginOfficerValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email format is invalid"),

  body("password").notEmpty().withMessage("Password is required"),
];

const refreshTokenValidation = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required"),
];

const logoutValidation = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required"),
];

const requestForgotPasswordOtpValidation = [
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
];

const verifyForgotPasswordOtpValidation = [
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

const resetForgotPasswordValidation = [
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirmPassword")
    .isLength({ min: 6 })
    .withMessage("Confirm password must be at least 6 characters"),
];

module.exports = {
  registerValidation,
  loginUserValidation,
  loginAdminValidation,
  loginOfficerValidation,
  refreshTokenValidation,
  logoutValidation,
  requestForgotPasswordOtpValidation,
  verifyForgotPasswordOtpValidation,
  resetForgotPasswordValidation,
};
