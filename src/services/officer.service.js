const { Op } = require("sequelize");
const { Officer, Role, OfficerService, Service } = require("../models");
const AppError = require("../utils/AppError");
const { hashPassword } = require("../utils/hash");

class OfficerServiceService {
  static async create(payload) {
    const existingEmail = await Officer.findOne({
      where: { email: payload.email },
    });

    if (existingEmail) {
      throw new AppError("Officer email already exists", 409);
    }

    if (payload.phoneNumber) {
      const existingPhone = await Officer.findOne({
        where: { phoneNumber: payload.phoneNumber },
      });

      if (existingPhone) {
        throw new AppError("Officer phone number already exists", 409);
      }
    }

    const roleDetail = await Role.findByPk(payload.roleId);

    if (!roleDetail) {
      throw new AppError("Role not found", 404);
    }

    if (!roleDetail.isActive) {
      throw new AppError("Role is inactive", 400);
    }

    const passwordHash = await hashPassword(payload.password);

    const officer = await Officer.create({
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber || null,
      email: payload.email,
      passwordHash,
      roleId: roleDetail.id,
      role: roleDetail.roleCode, // fallback legacy sementara
      status: payload.status || "AVAILABLE",
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    });

    return await Officer.findByPk(officer.id, {
      attributes: { exclude: ["passwordHash"] },
      include: [
        {
          model: Role,
          as: "roleDetail",
          attributes: ["id", "roleCode", "roleName", "isActive"],
          required: false,
        },
      ],
    });
  }

  static async getAll(query) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${query.search}%` } },
        { email: { [Op.iLike]: `%${query.search}%` } },
        { phoneNumber: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    const { count, rows } = await Officer.findAndCountAll({
      where,
      attributes: { exclude: ["passwordHash"] },
      include: [
        {
          model: Role,
          as: "roleDetail",
          attributes: ["id", "roleCode", "roleName", "isActive"],
          required: false,
        },
        {
          model: OfficerService,
          as: "officerServices",
          required: false,
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "serviceCode", "serviceName", "isActive"],
              required: false,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
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

  static async getById(id) {
    const officer = await Officer.findByPk(id, {
      attributes: { exclude: ["passwordHash"] },
      include: [
        {
          model: Role,
          as: "roleDetail",
          attributes: ["id", "roleCode", "roleName", "description", "isActive"],
          required: false,
        },
        {
          model: OfficerService,
          as: "officerServices",
          required: false,
          include: [
            {
              model: Service,
              as: "service",
              attributes: [
                "id",
                "serviceCode",
                "serviceName",
                "requiresDispatch",
                "autoAcceptMode",
                "acceptTimeoutSeconds",
                "isActive",
              ],
              required: false,
            },
          ],
        },
      ],
    });

    if (!officer) {
      throw new AppError("Officer not found", 404);
    }

    return officer;
  }

  static async update(id, payload) {
    const officer = await Officer.findByPk(id);

    if (!officer) {
      throw new AppError("Officer not found", 404);
    }

    if (payload.email && payload.email !== officer.email) {
      const existingEmail = await Officer.findOne({
        where: { email: payload.email },
      });

      if (existingEmail) {
        throw new AppError("Officer email already exists", 409);
      }
    }

    if (payload.phoneNumber && payload.phoneNumber !== officer.phoneNumber) {
      const existingPhone = await Officer.findOne({
        where: { phoneNumber: payload.phoneNumber },
      });

      if (existingPhone) {
        throw new AppError("Officer phone number already exists", 409);
      }
    }

    let roleDetail = null;

    if (payload.roleId !== undefined) {
      roleDetail = await Role.findByPk(payload.roleId);

      if (!roleDetail) {
        throw new AppError("Role not found", 404);
      }

      if (!roleDetail.isActive) {
        throw new AppError("Role is inactive", 400);
      }
    }

    const updatePayload = {
      ...(payload.fullName !== undefined && {
        fullName: payload.fullName,
      }),
      ...(payload.phoneNumber !== undefined && {
        phoneNumber: payload.phoneNumber,
      }),
      ...(payload.email !== undefined && {
        email: payload.email,
      }),
      ...(payload.status !== undefined && {
        status: payload.status,
      }),
      ...(payload.isActive !== undefined && {
        isActive: payload.isActive,
      }),
    };

    if (roleDetail) {
      updatePayload.roleId = roleDetail.id;
      updatePayload.role = roleDetail.roleCode; // fallback legacy sementara
    }

    if (payload.password) {
      updatePayload.passwordHash = await hashPassword(payload.password);
    }

    await officer.update(updatePayload);

    return await Officer.findByPk(id, {
      attributes: { exclude: ["passwordHash"] },
      include: [
        {
          model: Role,
          as: "roleDetail",
          attributes: ["id", "roleCode", "roleName", "isActive"],
          required: false,
        },
        {
          model: OfficerService,
          as: "officerServices",
          required: false,
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "serviceCode", "serviceName", "isActive"],
              required: false,
            },
          ],
        },
      ],
    });
  }

  static async deactivate(id) {
    const officer = await Officer.findByPk(id);

    if (!officer) {
      throw new AppError("Officer not found", 404);
    }

    await officer.update({
      isActive: false,
      status: "OFFLINE",
    });

    return await Officer.findByPk(id, {
      attributes: { exclude: ["passwordHash"] },
      include: [
        {
          model: Role,
          as: "roleDetail",
          attributes: ["id", "roleCode", "roleName", "isActive"],
          required: false,
        },
      ],
    });
  }

  static async updateMyStatus(authUser, status) {
    if (authUser.type !== "OFFICER") {
      throw new AppError("Only officer can update own status", 403);
    }

    const officer = await Officer.findByPk(authUser.id, {
      attributes: { exclude: ["passwordHash"] },
    });

    if (!officer) {
      throw new AppError("Officer not found", 404);
    }

    if (!officer.isActive) {
      throw new AppError("Officer account is inactive", 403);
    }

    const activeStatuses = ["ON_DUTY", "BUSY"];

    if (activeStatuses.includes(officer.status)) {
      throw new AppError(
        "Officer cannot go offline while handling active dispatch",
        400,
      );
    }

    await officer.update({
      status,
    });

    return await Officer.findByPk(authUser.id, {
      attributes: { exclude: ["passwordHash"] },
    });
  }
}

module.exports = OfficerServiceService;
