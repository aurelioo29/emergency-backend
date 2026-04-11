const { Op } = require("sequelize");
const { Ambulance } = require("../models");
const AppError = require("../utils/AppError");

class AmbulanceService {
  static async create(payload) {
    const existingCode = await Ambulance.findOne({
      where: { code: payload.code },
    });

    if (existingCode) {
      throw new AppError("Ambulance code already exists", 409);
    }

    if (payload.plateNumber) {
      const existingPlate = await Ambulance.findOne({
        where: { plateNumber: payload.plateNumber },
      });

      if (existingPlate) {
        throw new AppError("Ambulance plate number already exists", 409);
      }
    }

    const ambulance = await Ambulance.create({
      code: payload.code,
      plateNumber: payload.plateNumber || null,
      currentLatitude:
        payload.currentLatitude !== undefined
          ? Number(payload.currentLatitude)
          : null,
      currentLongitude:
        payload.currentLongitude !== undefined
          ? Number(payload.currentLongitude)
          : null,
      status: payload.status || "AVAILABLE",
    });

    return ambulance;
  }

  static async getAll(query) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.search) {
      where[Op.or] = [
        { code: { [Op.iLike]: `%${query.search}%` } },
        { plateNumber: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const { count, rows } = await Ambulance.findAndCountAll({
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
    const ambulance = await Ambulance.findByPk(id);

    if (!ambulance) {
      throw new AppError("Ambulance not found", 404);
    }

    return ambulance;
  }

  static async update(id, payload) {
    const ambulance = await Ambulance.findByPk(id);

    if (!ambulance) {
      throw new AppError("Ambulance not found", 404);
    }

    if (payload.code && payload.code !== ambulance.code) {
      const existingCode = await Ambulance.findOne({
        where: { code: payload.code },
      });

      if (existingCode) {
        throw new AppError("Ambulance code already exists", 409);
      }
    }

    if (payload.plateNumber && payload.plateNumber !== ambulance.plateNumber) {
      const existingPlate = await Ambulance.findOne({
        where: { plateNumber: payload.plateNumber },
      });

      if (existingPlate) {
        throw new AppError("Ambulance plate number already exists", 409);
      }
    }

    await ambulance.update({
      ...(payload.code !== undefined && {
        code: payload.code,
      }),
      ...(payload.plateNumber !== undefined && {
        plateNumber: payload.plateNumber,
      }),
      ...(payload.currentLatitude !== undefined && {
        currentLatitude:
          payload.currentLatitude === null
            ? null
            : Number(payload.currentLatitude),
      }),
      ...(payload.currentLongitude !== undefined && {
        currentLongitude:
          payload.currentLongitude === null
            ? null
            : Number(payload.currentLongitude),
      }),
      ...(payload.status !== undefined && {
        status: payload.status,
      }),
    });

    return ambulance;
  }

  static async delete(id) {
    const ambulance = await Ambulance.findByPk(id);

    if (!ambulance) {
      throw new AppError("Ambulance not found", 404);
    }

    await ambulance.destroy();

    return {
      deleted: true,
    };
  }
}

module.exports = AmbulanceService;
