const { OfficerService, Officer, Service } = require("../models");
const AppError = require("../utils/AppError");

class OfficerServiceService {
  static async assignService(authUser, payload) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can assign service to officer", 403);
    }

    const { officerId, serviceId, isPrimary = false } = payload;

    const officer = await Officer.findByPk(officerId);
    if (!officer) {
      throw new AppError("Officer not found", 404);
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      throw new AppError("Service not found", 404);
    }

    if (!service.isActive) {
      throw new AppError("Service is inactive", 400);
    }

    const existing = await OfficerService.findOne({
      where: { officerId, serviceId },
    });

    if (existing) {
      throw new AppError("This officer already has that service", 409);
    }

    if (isPrimary) {
      await OfficerService.update(
        { isPrimary: false },
        { where: { officerId } },
      );
    }

    const officerService = await OfficerService.create({
      officerId,
      serviceId,
      isPrimary,
    });

    return await this.getById(officerService.id);
  }

  static async getById(id) {
    const officerService = await OfficerService.findByPk(id, {
      include: [
        {
          model: Officer,
          as: "officer",
          attributes: [
            "id",
            "fullName",
            "phoneNumber",
            "email",
            "role",
            "status",
          ],
        },
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
        },
      ],
    });

    if (!officerService) {
      throw new AppError("Officer service mapping not found", 404);
    }

    return officerService;
  }

  static async getAll(query) {
    const where = {};

    if (query.officerId) {
      where.officerId = query.officerId;
    }

    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    return OfficerService.findAll({
      where,
      include: [
        {
          model: Officer,
          as: "officer",
          attributes: [
            "id",
            "fullName",
            "phoneNumber",
            "email",
            "role",
            "status",
          ],
        },
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
        },
      ],
      order: [
        ["isPrimary", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
  }

  static async getByOfficer(officerId) {
    const officer = await Officer.findByPk(officerId);

    if (!officer) {
      throw new AppError("Officer not found", 404);
    }

    return OfficerService.findAll({
      where: { officerId },
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
        },
      ],
      order: [
        ["isPrimary", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
  }

  static async update(authUser, id, payload) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can update officer service mapping", 403);
    }

    const mapping = await OfficerService.findByPk(id);

    if (!mapping) {
      throw new AppError("Officer service mapping not found", 404);
    }

    if (payload.isPrimary === true) {
      await OfficerService.update(
        { isPrimary: false },
        { where: { officerId: mapping.officerId } },
      );
    }

    await mapping.update({
      isPrimary:
        payload.isPrimary !== undefined ? payload.isPrimary : mapping.isPrimary,
    });

    return await this.getById(mapping.id);
  }

  static async remove(authUser, id) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can delete officer service mapping", 403);
    }

    const mapping = await OfficerService.findByPk(id);

    if (!mapping) {
      throw new AppError("Officer service mapping not found", 404);
    }

    await mapping.destroy();

    return { success: true };
  }
}

module.exports = OfficerServiceService;
