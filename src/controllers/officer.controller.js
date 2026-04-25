const OfficerServiceService = require("../services/officer.service");
const { sendSuccess } = require("../utils/response");

class OfficerController {
  static async create(req, res, next) {
    try {
      const result = await OfficerServiceService.create(req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: "Officer created successfully",
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
        message: "Get officers success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await OfficerServiceService.getById(req.params.id);

      return sendSuccess(res, {
        message: "Get officer detail success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await OfficerServiceService.update(
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Officer updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deactivate(req, res, next) {
    try {
      const result = await OfficerServiceService.deactivate(req.params.id);

      return sendSuccess(res, {
        message: "Officer deactivated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyStatus(req, res, next) {
    try {
      const result = await OfficerServiceService.updateMyStatus(
        req.user,
        req.body.status,
      );

      return sendSuccess(res, {
        message: "Officer status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OfficerController;
