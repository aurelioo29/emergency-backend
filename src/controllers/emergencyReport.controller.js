const EmergencyReportService = require("../services/emergencyReport.service");
const { sendSuccess } = require("../utils/response");

class EmergencyReportController {
  static async create(req, res, next) {
    try {
      const result = await EmergencyReportService.createReport(
        req.user,
        req.body,
      );

      return sendSuccess(res, {
        statusCode: 201,
        message: "Emergency report created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyReports(req, res, next) {
    try {
      const result = await EmergencyReportService.getMyReports(
        req.user,
        req.query,
      );

      return sendSuccess(res, {
        message: "Get my emergency reports success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await EmergencyReportService.getAllReports(
        req.user,
        req.query,
      );

      return sendSuccess(res, {
        message: "Get all emergency reports success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDetail(req, res, next) {
    try {
      const result = await EmergencyReportService.getReportDetail(
        req.user,
        req.params.id,
      );

      return sendSuccess(res, {
        message: "Get emergency report detail success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const result = await EmergencyReportService.updateStatus(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Emergency report status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmergencyReportController;
