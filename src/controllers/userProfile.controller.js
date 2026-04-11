const UserProfileService = require("../services/userProfile.service");
const { sendSuccess } = require("../utils/response");

class UserProfileController {
  static async getMyProfile(req, res, next) {
    try {
      const result = await UserProfileService.getMyProfile(req.user);

      return sendSuccess(res, {
        message: "Get my profile success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req, res, next) {
    try {
      const result = await UserProfileService.updateMyProfile(
        req.user,
        req.body,
      );

      return sendSuccess(res, {
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const result = await UserProfileService.changePassword(
        req.user,
        req.body,
      );

      return sendSuccess(res, {
        message: "Password changed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEmergencyContacts(req, res, next) {
    try {
      const result = await UserProfileService.getEmergencyContacts(req.user);

      return sendSuccess(res, {
        message: "Get emergency contacts success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createEmergencyContact(req, res, next) {
    try {
      const result = await UserProfileService.createEmergencyContact(
        req.user,
        req.body,
      );

      return sendSuccess(res, {
        statusCode: 201,
        message: "Emergency contact created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateEmergencyContact(req, res, next) {
    try {
      const result = await UserProfileService.updateEmergencyContact(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Emergency contact updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEmergencyContact(req, res, next) {
    try {
      const result = await UserProfileService.deleteEmergencyContact(
        req.user,
        req.params.id,
      );

      return sendSuccess(res, {
        message: "Emergency contact deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDiseaseHistories(req, res, next) {
    try {
      const result = await UserProfileService.getDiseaseHistories(req.user);

      return sendSuccess(res, {
        message: "Get disease histories success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDiseaseHistory(req, res, next) {
    try {
      const result = await UserProfileService.createDiseaseHistory(
        req.user,
        req.body,
      );

      return sendSuccess(res, {
        statusCode: 201,
        message: "Disease history created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDiseaseHistory(req, res, next) {
    try {
      const result = await UserProfileService.updateDiseaseHistory(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Disease history updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDiseaseHistory(req, res, next) {
    try {
      const result = await UserProfileService.deleteDiseaseHistory(
        req.user,
        req.params.id,
      );

      return sendSuccess(res, {
        message: "Disease history deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserProfileController;
