const AuthService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: "Register success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async loginUser(req, res, next) {
    try {
      const result = await AuthService.loginUser(req.body);

      return sendSuccess(res, {
        message: "Login success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async loginAdmin(req, res, next) {
    try {
      const result = await AuthService.loginAdmin(req.body);

      return sendSuccess(res, {
        message: "Admin login success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async loginOfficer(req, res, next) {
    try {
      const result = await AuthService.loginOfficer(req.body);

      return sendSuccess(res, {
        message: "Officer login success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const result = await AuthService.refreshToken(req.body);

      return sendSuccess(res, {
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const result = await AuthService.logout(req.user, req.body);

      return sendSuccess(res, {
        message: "Logout success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      const result = await AuthService.getCurrentUser(req.user);

      return sendSuccess(res, {
        message: "Get current user success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
