const OfficerServiceService = require("../services/officerService.service");
const { sendSuccess } = require("../utils/response");

class OfficerServiceController {
  static async create(req, res, next) {
    try {
      const result = await OfficerServiceService.assignService(
        req.user,
        req.body,
      );

      return sendSuccess(res, {
        statusCode: 201,
        message: "Officer service assigned successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await OfficerServiceService.getAll(req.query);

      return sendSuccess(res, {
        message: "Get officer service mappings success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByOfficer(req, res, next) {
    try {
      const result = await OfficerServiceService.getByOfficer(
        req.params.officerId,
      );

      return sendSuccess(res, {
        message: "Get officer services success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await OfficerServiceService.update(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Officer service mapping updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req, res, next) {
    try {
      await OfficerServiceService.remove(req.user, req.params.id);

      return sendSuccess(res, {
        message: "Officer service mapping deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OfficerServiceController;
