const DispatchService = require("../services/dispatch.service");
const { sendSuccess } = require("../utils/response");

class DispatchController {
  static async create(req, res, next) {
    try {
      const result = await DispatchService.createDispatch(req.user, req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: "Dispatch created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await DispatchService.getAllDispatches(
        req.user,
        req.query,
      );

      return sendSuccess(res, {
        message: "Get all dispatches success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByReport(req, res, next) {
    try {
      const result = await DispatchService.getDispatchesByReport(
        req.user,
        req.params.reportId,
      );

      return sendSuccess(res, {
        message: "Get dispatches by report success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const result = await DispatchService.updateDispatchStatus(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Dispatch status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async accept(req, res, next) {
    try {
      const result = await DispatchService.acceptDispatch(
        req.user,
        req.params.id,
      );

      return sendSuccess(res, {
        message: "Dispatch accepted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async start(req, res, next) {
    try {
      const result = await DispatchService.startDispatch(
        req.user,
        req.params.id,
      );

      return sendSuccess(res, {
        message: "Dispatch started successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async arrive(req, res, next) {
    try {
      const result = await DispatchService.arriveDispatch(
        req.user,
        req.params.id,
      );

      return sendSuccess(res, {
        message: "Dispatch arrival updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async complete(req, res, next) {
    try {
      const result = await DispatchService.completeDispatch(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Dispatch completed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req, res, next) {
    try {
      const result = await DispatchService.rejectDispatch(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Dispatch rejected successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableReports(req, res, next) {
    try {
      const result = await DispatchService.getAvailableReportsForOfficer(
        req.user,
        req.query,
      );

      return sendSuccess(res, {
        message: "Get available reports success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async acceptAvailableReport(req, res, next) {
    try {
      const result = await DispatchService.acceptAvailableReport(
        req.user,
        req.params.reportId,
      );

      return sendSuccess(res, {
        message: "Report accepted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DispatchController;
