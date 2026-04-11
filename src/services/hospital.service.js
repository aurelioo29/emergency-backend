const { Op } = require("sequelize");
const { Hospital } = require("../models");
const AppError = require("../utils/AppError");

class HospitalService {
  static async create(payload) {
    const hospital = await Hospital.create({
      hospitalName: payload.hospitalName,
      address: payload.address,
      phoneNumber: payload.phoneNumber || null,
      latitude:
        payload.latitude !== undefined ? Number(payload.latitude) : null,
      longitude:
        payload.longitude !== undefined ? Number(payload.longitude) : null,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    });

    return hospital;
  }

  static async getAll(query) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.search) {
      where[Op.or] = [
        { hospitalName: { [Op.iLike]: `%${query.search}%` } },
        { address: { [Op.iLike]: `%${query.search}%` } },
        { phoneNumber: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    const { count, rows } = await Hospital.findAndCountAll({
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

  static async getById(id) {
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      throw new AppError("Hospital not found", 404);
    }

    return hospital;
  }

  static async update(id, payload) {
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      throw new AppError("Hospital not found", 404);
    }

    await hospital.update({
      ...(payload.hospitalName !== undefined && {
        hospitalName: payload.hospitalName,
      }),
      ...(payload.address !== undefined && {
        address: payload.address,
      }),
      ...(payload.phoneNumber !== undefined && {
        phoneNumber: payload.phoneNumber,
      }),
      ...(payload.latitude !== undefined && {
        latitude: payload.latitude === null ? null : Number(payload.latitude),
      }),
      ...(payload.longitude !== undefined && {
        longitude:
          payload.longitude === null ? null : Number(payload.longitude),
      }),
      ...(payload.isActive !== undefined && {
        isActive: payload.isActive,
      }),
    });

    return hospital;
  }

  static async delete(id) {
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      throw new AppError("Hospital not found", 404);
    }

    await hospital.destroy();

    return {
      deleted: true,
    };
  }
}

module.exports = HospitalService;
