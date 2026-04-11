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

module.exports = router;
