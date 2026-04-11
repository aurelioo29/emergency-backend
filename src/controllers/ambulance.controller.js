const AmbulanceService = require("../services/ambulance.service");
const { sendSuccess } = require("../utils/response");

class AmbulanceController {
  static async create(req, res, next) {
    try {
      const result = await AmbulanceService.create(req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: "Ambulance created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await AmbulanceService.getAll(req.query);

      return sendSuccess(res, {
        message: "Get ambulances success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await AmbulanceService.getById(req.params.id);

      return sendSuccess(res, {
        message: "Get ambulance detail success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await AmbulanceService.update(req.params.id, req.body);

      return sendSuccess(res, {
        message: "Ambulance updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await AmbulanceService.delete(req.params.id);

      return sendSuccess(res, {
        message: "Ambulance deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AmbulanceController;
