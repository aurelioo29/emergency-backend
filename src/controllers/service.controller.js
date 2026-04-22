const ServiceService = require("../services/service.service");
const { sendSuccess } = require("../utils/response");

class ServiceController {
  static async create(req, res, next) {
    try {
      const result = await ServiceService.createService(req.user, req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: "Service created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await ServiceService.getAllServices(req.query);

      return sendSuccess(res, {
        message: "Get all services success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActive(req, res, next) {
    try {
      const result = await ServiceService.getActiveServices();

      return sendSuccess(res, {
        message: "Get active services success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDetail(req, res, next) {
    try {
      const result = await ServiceService.getServiceById(req.params.id);

      return sendSuccess(res, {
        message: "Get service detail success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await ServiceService.updateService(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Service updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleActive(req, res, next) {
    try {
      const result = await ServiceService.toggleServiceActive(
        req.user,
        req.params.id,
        req.body.isActive,
      );

      return sendSuccess(res, {
        message: "Service active status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceController;
