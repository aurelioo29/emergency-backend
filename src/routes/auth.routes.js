const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  registerValidation,
  loginUserValidation,
  loginAdminValidation,
  loginOfficerValidation,
  refreshTokenValidation,
  logoutValidation,
  requestForgotPasswordOtpValidation,
  verifyForgotPasswordOtpValidation,
  resetForgotPasswordValidation,
} = require("../validations/auth.validation");

router.post("/register", registerValidation, validate, AuthController.register);

router.post("/login", loginUserValidation, validate, AuthController.loginUser);

router.post(
  "/admin/login",
  loginAdminValidation,
  validate,
  AuthController.loginAdmin,
);

router.post(
  "/officer/login",
  loginOfficerValidation,
  validate,
  AuthController.loginOfficer,
);

router.post(
  "/refresh",
  refreshTokenValidation,
  validate,
  AuthController.refresh,
);

router.post(
  "/logout",
  authMiddleware,
  logoutValidation,
  validate,
  AuthController.logout,
);

router.get("/me", authMiddleware, AuthController.me);

router.post(
  "/forgot-password/request-otp",
  requestForgotPasswordOtpValidation,
  validate,
  AuthController.requestForgotPasswordOtp,
);

router.post(
  "/forgot-password/verify-otp",
  verifyForgotPasswordOtpValidation,
  validate,
  AuthController.verifyForgotPasswordOtp,
);

router.post(
  "/forgot-password/reset",
  resetForgotPasswordValidation,
  validate,
  AuthController.resetForgotPassword,
);

module.exports = router;
