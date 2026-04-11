const OfficerLocationService = require("../services/officerLocation.service");
const { sendSuccess } = require("../utils/response");

class OfficerLocationController {
  static async update(req, res, next) {
    try {
      const result = await OfficerLocationService.updateLocation(
        req.user,
        req.body,
      );

      return sendSuccess(res, {
        message: "Location updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLatest(req, res, next) {
    try {
      const result = await OfficerLocationService.getLatestLocationByReport(
        req.user,
        req.params.reportId,
      );

      return sendSuccess(res, {
        message: "Get latest location success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const result = await OfficerLocationService.getLocationHistory(
        req.user,
        req.params.reportId,
      );

      return sendSuccess(res, {
        message: "Get location history success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OfficerLocationController;
