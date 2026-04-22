const { Op } = require("sequelize");
const { Role } = require("../models");
const AppError = require("../utils/AppError");

class RoleService {
  static async createRole(authUser, payload) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can create role", 403);
    }

    const existingRole = await Role.findOne({
      where: {
        roleCode: payload.roleCode.toUpperCase(),
      },
    });

    if (existingRole) {
      throw new AppError("Role code already exists", 409);
    }

    const role = await Role.create({
      roleCode: payload.roleCode.toUpperCase(),
      roleName: payload.roleName,
      description: payload.description || null,
      isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
    });

    return role;
  }

  static async getAllRoles(query) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    if (query.search) {
      where[Op.or] = [
        { roleCode: { [Op.iLike]: `%${query.search}%` } },
        { roleName: { [Op.iLike]: `%${query.search}%` } },
        { description: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { count, rows } = await Role.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      items: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getActiveRoles() {
    return Role.findAll({
      where: { isActive: true },
      order: [["roleName", "ASC"]],
    });
  }

  static async getRoleById(id) {
    const role = await Role.findByPk(id);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    return role;
  }

  static async updateRole(authUser, id, payload) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can update role", 403);
    }

    const role = await Role.findByPk(id);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    if (payload.roleCode) {
      const existing = await Role.findOne({
        where: {
          roleCode: payload.roleCode.toUpperCase(),
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        throw new AppError("Role code already exists", 409);
      }
    }

    await role.update({
      roleCode: payload.roleCode
        ? payload.roleCode.toUpperCase()
        : role.roleCode,
      roleName: payload.roleName ?? role.roleName,
      description:
        payload.description !== undefined
          ? payload.description
          : role.description,
      isActive:
        payload.isActive !== undefined ? payload.isActive : role.isActive,
    });

    return role;
  }

  static async toggleRoleActive(authUser, id, isActive) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can update role status", 403);
    }

    const role = await Role.findByPk(id);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    await role.update({ isActive });

    return role;
  }
}

module.exports = RoleService;
