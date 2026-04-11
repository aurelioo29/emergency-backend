const HospitalService = require("../services/hospital.service");
const { sendSuccess } = require("../utils/response");

class HospitalController {
  static async create(req, res, next) {
    try {
      const result = await HospitalService.create(req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: "Hospital created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await HospitalService.getAll(req.query);

      return sendSuccess(res, {
        message: "Get hospitals success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await HospitalService.getById(req.params.id);

      return sendSuccess(res, {
        message: "Get hospital detail success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await HospitalService.update(req.params.id, req.body);

      return sendSuccess(res, {
        message: "Hospital updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await HospitalService.delete(req.params.id);

      return sendSuccess(res, {
        message: "Hospital deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HospitalController;
