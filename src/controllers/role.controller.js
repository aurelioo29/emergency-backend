const RoleService = require("../services/role.service");
const { sendSuccess } = require("../utils/response");

class RoleController {
  static async create(req, res, next) {
    try {
      const result = await RoleService.createRole(req.user, req.body);

      return sendSuccess(res, {
        statusCode: 201,
        message: "Role created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const result = await RoleService.getAllRoles(req.query);

      return sendSuccess(res, {
        message: "Get all roles success",
        data: result.items,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActive(req, res, next) {
    try {
      const result = await RoleService.getActiveRoles();

      return sendSuccess(res, {
        message: "Get active roles success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDetail(req, res, next) {
    try {
      const result = await RoleService.getRoleById(req.params.id);

      return sendSuccess(res, {
        message: "Get role detail success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await RoleService.updateRole(
        req.user,
        req.params.id,
        req.body,
      );

      return sendSuccess(res, {
        message: "Role updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleActive(req, res, next) {
    try {
      const result = await RoleService.toggleRoleActive(
        req.user,
        req.params.id,
        req.body.isActive,
      );

      return sendSuccess(res, {
        message: "Role active status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoleController;
