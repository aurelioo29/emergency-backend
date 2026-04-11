const { Op } = require("sequelize");
const { Officer } = require("../models");
const AppError = require("../utils/AppError");
const { hashPassword } = require("../utils/hash");

class OfficerService {
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

    const passwordHash = await hashPassword(payload.password);

    const officer = await Officer.create({
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber || null,
      email: payload.email,
      passwordHash,
      role: payload.role,
      status: payload.status || "AVAILABLE",
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    });

    return officer;
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

    if (query.role) {
      where.role = query.role;
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

  static async getById(id) {
    const officer = await Officer.findByPk(id, {
      attributes: { exclude: ["passwordHash"] },
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
      ...(payload.role !== undefined && {
        role: payload.role,
      }),
      ...(payload.status !== undefined && {
        status: payload.status,
      }),
      ...(payload.isActive !== undefined && {
        isActive: payload.isActive,
      }),
    };

    if (payload.password) {
      updatePayload.passwordHash = await hashPassword(payload.password);
    }

    await officer.update(updatePayload);

    return await Officer.findByPk(id, {
      attributes: { exclude: ["passwordHash"] },
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
    });
  }
}

module.exports = OfficerService;
