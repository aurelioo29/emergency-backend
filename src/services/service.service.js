const { Op } = require("sequelize");
const { Service } = require("../models");
const AppError = require("../utils/AppError");

class ServiceService {
  static normalizeBoolean(value, defaultValue = false) {
    if (value === undefined || value === null || value === "")
      return defaultValue;
    if (typeof value === "boolean") return value;
    return value === "true";
  }

  static getIconUrl(file) {
    if (!file) return null;
    return `/uploads/services/${file.filename}`;
  }

  static async createService(authUser, payload, iconFile) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can create service", 403);
    }

    const existingService = await Service.findOne({
      where: {
        serviceCode: payload.serviceCode.toUpperCase(),
      },
    });

    if (existingService) {
      throw new AppError("Service code already exists", 409);
    }

    const iconUrl = this.getIconUrl(iconFile);

    const service = await Service.create({
      serviceCode: payload.serviceCode.toUpperCase(),
      serviceName: payload.serviceName,
      description: payload.description || null,
      iconName: payload.iconName || null,
      iconUrl,
      colorHex: payload.colorHex || null,
      requiresDispatch: this.normalizeBoolean(payload.requiresDispatch, true),
      autoAcceptMode: payload.autoAcceptMode || "CONFIRM",
      acceptTimeoutSeconds:
        payload.acceptTimeoutSeconds !== undefined
          ? Number(payload.acceptTimeoutSeconds)
          : 15,
      isActive: this.normalizeBoolean(payload.isActive, true),
    });

    return service;
  }

  static async getAllServices(query) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    if (query.search) {
      where[Op.or] = [
        { serviceCode: { [Op.iLike]: `%${query.search}%` } },
        { serviceName: { [Op.iLike]: `%${query.search}%` } },
        { description: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { count, rows } = await Service.findAndCountAll({
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

  static async getActiveServices() {
    return await Service.findAll({
      where: { isActive: true },
      order: [["serviceName", "ASC"]],
    });
  }

  static async getServiceById(id) {
    const service = await Service.findByPk(id);

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    return service;
  }

  static async updateService(authUser, id, payload, iconFile) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can update service", 403);
    }

    const service = await Service.findByPk(id);

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    if (payload.serviceCode) {
      const existingCode = await Service.findOne({
        where: {
          serviceCode: payload.serviceCode.toUpperCase(),
          id: { [Op.ne]: id },
        },
      });

      if (existingCode) {
        throw new AppError("Service code already exists", 409);
      }
    }

    const nextIconUrl = iconFile ? this.getIconUrl(iconFile) : service.iconUrl;

    await service.update({
      serviceCode: payload.serviceCode
        ? payload.serviceCode.toUpperCase()
        : service.serviceCode,
      serviceName: payload.serviceName ?? service.serviceName,
      description:
        payload.description !== undefined
          ? payload.description
          : service.description,
      iconName:
        payload.iconName !== undefined ? payload.iconName : service.iconName,
      iconUrl: nextIconUrl,
      colorHex:
        payload.colorHex !== undefined ? payload.colorHex : service.colorHex,
      requiresDispatch:
        payload.requiresDispatch !== undefined
          ? this.normalizeBoolean(
              payload.requiresDispatch,
              service.requiresDispatch,
            )
          : service.requiresDispatch,
      autoAcceptMode: payload.autoAcceptMode ?? service.autoAcceptMode,
      acceptTimeoutSeconds:
        payload.acceptTimeoutSeconds !== undefined
          ? Number(payload.acceptTimeoutSeconds)
          : service.acceptTimeoutSeconds,
      isActive:
        payload.isActive !== undefined
          ? this.normalizeBoolean(payload.isActive, service.isActive)
          : service.isActive,
    });

    return service;
  }

  static async toggleServiceActive(authUser, id, isActive) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can update service status", 403);
    }

    const service = await Service.findByPk(id);

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    await service.update({
      isActive: this.normalizeBoolean(isActive, service.isActive),
    });

    return service;
  }
}

module.exports = ServiceService;
