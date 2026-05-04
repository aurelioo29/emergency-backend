const {
  EmergencyReport,
  ReportTrackingLog,
  Hospital,
  User,
  Dispatch,
  Officer,
  Ambulance,
  AdminUser,
  Service,
} = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");
const {
  emitToAdminRoom,
  emitToUser,
  emitToOfficer,
  emitToReportRoom,
} = require("../socket/emitter");
const DispatchService = require("./dispatch.service");

class EmergencyReportService {
  static generateReportCode() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);

    return `EMG-${yyyy}${mm}${dd}-${rand}`;
  }

  static mapServiceCodeToLegacyEmergencyType(serviceCode) {
    switch (serviceCode) {
      case "AMBULANCE":
        return "AMBULANCE";
      case "FIRE":
        return "FIRE";
      case "POLICE":
        return "CRIME";
      default:
        return "SOS";
    }
  }

  static async createReport(authUser, payload, photoFile) {
    const {
      serviceId,
      emergencyType,
      description,
      latitude,
      longitude,
      addressSnapshot,
      photoCapturedAt,
    } = payload;

    if (!photoFile) {
      throw new AppError("Photo is required", 400);
    }

    const service = await Service.findOne({
      where: {
        id: serviceId,
        isActive: true,
      },
    });

    if (!service) {
      throw new AppError("Service not found or inactive", 404);
    }

    const reportCode = this.generateReportCode();
    const photoUrl = `/uploads/emergency-reports/${photoFile.filename}`;

    const legacyEmergencyType =
      emergencyType ||
      this.mapServiceCodeToLegacyEmergencyType(service.serviceCode);

    const report = await EmergencyReport.create({
      reportCode,
      userId: authUser.id,
      serviceId: service.id,
      emergencyType: legacyEmergencyType,
      description: description || null,
      latitude,
      longitude,
      addressSnapshot: addressSnapshot || null,
      photoUrl,
      photoCapturedAt: photoCapturedAt || new Date(),
      status: "REPORTED",
      requestedAt: new Date(),
    });

    await ReportTrackingLog.create({
      reportId: report.id,
      status: "REPORTED",
      notes: `Emergency report created by user for service ${service.serviceName}`,
      updatedByType: "USER",
      updatedById: authUser.id,
    });

    emitToAdminRoom("report:created", {
      id: report.id,
      reportCode: report.reportCode,
      latitude: report.latitude,
      longitude: report.longitude,
      status: report.status,
      serviceId: service.id,
      serviceName: service.serviceName,
    });

    emitToUser(authUser.id, "report:created", {
      id: report.id,
      reportCode: report.reportCode,
      status: report.status,
    });

    // emitToOfficer("broadcast", "report:available", {
    //   id: report.id,
    //   reportCode: report.reportCode,
    //   latitude: report.latitude,
    //   longitude: report.longitude,
    //   status: report.status,
    //   serviceId: service.id,
    //   serviceName: service.serviceName,
    // });

    const reportDetail = await this.getReportDetail(authUser, report.id);

    return {
      report: reportDetail,
    };
  }

  static async getMyReports(authUser, query) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can access own reports", 403);
    }

    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const offset = (page - 1) * limit;

    const where = {
      userId: authUser.id,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.emergencyType) {
      where.emergencyType = query.emergencyType;
    }

    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    const { count, rows } = await EmergencyReport.findAndCountAll({
      where,
      include: [
        {
          model: Service,
          as: "service",
          attributes: [
            "id",
            "serviceCode",
            "serviceName",
            "iconName",
            "colorHex",
            "requiresDispatch",
            "autoAcceptMode",
            "acceptTimeoutSeconds",
          ],
          required: false,
        },
        {
          model: Hospital,
          as: "nearestHospital",
          attributes: ["id", "hospitalName", "phoneNumber"],
          required: false,
        },
      ],
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

  static async getReportDetail(authUser, reportId) {
    const where = { id: reportId };

    if (authUser.type === "USER") {
      where.userId = authUser.id;
    }

    const report = await EmergencyReport.findOne({
      where,
      include: [
        {
          model: Service,
          as: "service",
          attributes: [
            "id",
            "serviceCode",
            "serviceName",
            "description",
            "iconName",
            "colorHex",
            "requiresDispatch",
            "autoAcceptMode",
            "acceptTimeoutSeconds",
            "isActive",
          ],
          required: false,
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "nik", "phoneNumber", "address"],
        },
        {
          model: Hospital,
          as: "nearestHospital",
          attributes: ["id", "hospitalName", "phoneNumber", "address"],
          required: false,
        },
        {
          model: ReportTrackingLog,
          as: "trackingLogs",
          separate: true,
          order: [["created_at", "DESC"]],
        },
        {
          model: Dispatch,
          as: "dispatches",
          separate: true,
          order: [["assignedAt", "DESC"]],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "serviceCode", "serviceName"],
              required: false,
            },
            {
              model: Officer,
              as: "officer",
              attributes: ["id", "fullName", "phoneNumber", "role", "status"],
              required: false,
            },
            {
              model: Ambulance,
              as: "ambulance",
              attributes: ["id", "code", "plateNumber", "status"],
              required: false,
            },
            {
              model: AdminUser,
              as: "assignedByAdmin",
              attributes: ["id", "fullName", "email", "role"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!report) {
      throw new AppError("Emergency report not found", 404);
    }

    return report;
  }

  static async getAllReports(authUser, query) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can access all reports", 403);
    }

    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.emergencyType) {
      where.emergencyType = query.emergencyType;
    }

    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    if (query.search) {
      where[Op.or] = [
        { reportCode: { [Op.iLike]: `%${query.search}%` } },
        { emergencyType: { [Op.iLike]: `%${query.search}%` } },
        { status: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { count, rows } = await EmergencyReport.findAndCountAll({
      where,
      include: [
        {
          model: Service,
          as: "service",
          attributes: [
            "id",
            "serviceCode",
            "serviceName",
            "iconName",
            "colorHex",
            "requiresDispatch",
            "autoAcceptMode",
          ],
          required: false,
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "phoneNumber"],
        },
        {
          model: Hospital,
          as: "nearestHospital",
          attributes: ["id", "hospitalName", "phoneNumber"],
          required: false,
        },
      ],
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

  static async updateStatus(authUser, reportId, payload) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can update emergency report status", 403);
    }

    const { status, notes } = payload;

    const report = await EmergencyReport.findByPk(reportId);

    if (!report) {
      throw new AppError("Emergency report not found", 404);
    }

    const allowedStatuses = [
      "REPORTED",
      "ASSIGNED",
      "ACCEPTED",
      "ON_THE_WAY",
      "ARRIVED",
      "HANDLING",
      "COMPLETED",
      "CANCELLED",
      "FAILED",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new AppError("Invalid emergency report status", 400);
    }

    const updatePayload = {
      status,
    };

    if (status === "ASSIGNED") {
      updatePayload.assignedAt = new Date();
    }

    if (status === "ACCEPTED") {
      updatePayload.acceptedAt = new Date();
    }

    if (status === "ARRIVED") {
      updatePayload.arrivedAt = new Date();
    }

    if (status === "COMPLETED") {
      updatePayload.completedAt = new Date();
    }

    if (status === "CANCELLED") {
      updatePayload.cancelledAt = new Date();
    }

    if (status === "FAILED") {
      updatePayload.failedAt = new Date();
    }

    await report.update(updatePayload);

    await ReportTrackingLog.create({
      reportId: report.id,
      status,
      notes: notes || `Report status updated to ${status}`,
      updatedByType: "ADMIN",
      updatedById: authUser.id,
    });

    emitToAdminRoom("report:updated", {
      reportId: report.id,
      status: report.status,
      updatedAt: new Date(),
    });

    emitToUser(report.userId, "report:updated", {
      reportId: report.id,
      status: report.status,
      updatedAt: new Date(),
    });

    emitToReportRoom(report.id, "report:updated", {
      reportId: report.id,
      status: report.status,
      updatedAt: new Date(),
    });

    return report;
  }

  static async cancelReport(authUser, reportId, payload = {}) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can cancel own emergency report", 403);
    }

    const report = await EmergencyReport.findByPk(reportId, {
      include: [
        {
          model: Dispatch,
          as: "dispatches",
          required: false,
          include: [
            {
              model: Officer,
              as: "officer",
              required: false,
            },
            {
              model: Ambulance,
              as: "ambulance",
              required: false,
            },
          ],
        },
        {
          model: Service,
          as: "service",
          required: false,
        },
      ],
    });

    if (!report) {
      throw new AppError("Emergency report not found", 404);
    }

    if (report.userId !== authUser.id) {
      throw new AppError("You can only cancel your own report", 403);
    }

    const allowedCancelStatuses = ["REPORTED", "ASSIGNED"];

    if (!allowedCancelStatuses.includes(report.status)) {
      throw new AppError(
        `Report with status ${report.status} cannot be cancelled`,
        400,
      );
    }

    const now = new Date();
    const notes = payload.notes || "Emergency report cancelled by user";

    await report.update({
      status: "CANCELLED",
      cancelledAt: now,
    });

    const activeDispatches = (report.dispatches || []).filter((dispatch) => {
      return !["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"].includes(
        dispatch.dispatchStatus,
      );
    });

    for (const dispatch of activeDispatches) {
      await dispatch.update({
        dispatchStatus: "CANCELLED",
        cancelledAt: now,
        notes,
      });

      if (dispatch.officer) {
        await dispatch.officer.update({
          status: "AVAILABLE",
        });
      }

      emitToAdminRoom("dispatch:updated", {
        id: dispatch.id,
        reportId: report.id,
        dispatchStatus: "CANCELLED",
        reason: "REPORT_CANCELLED_BY_USER",
      });

      if (dispatch.officerId) {
        emitToOfficer(dispatch.officerId, "dispatch:updated", {
          id: dispatch.id,
          reportId: report.id,
          dispatchStatus: "CANCELLED",
          reason: "REPORT_CANCELLED_BY_USER",
        });
      }

      emitToReportRoom(report.id, "dispatch:updated", {
        id: dispatch.id,
        reportId: report.id,
        dispatchStatus: "CANCELLED",
        reason: "REPORT_CANCELLED_BY_USER",
      });
    }

    await ReportTrackingLog.create({
      reportId: report.id,
      status: "CANCELLED",
      notes,
      updatedByType: "USER",
      updatedById: authUser.id,
    });

    const payloadSocket = {
      reportId: report.id,
      id: report.id,
      reportCode: report.reportCode,
      status: "CANCELLED",
      reason: "REPORT_CANCELLED_BY_USER",
    };

    emitToAdminRoom("report:updated", payloadSocket);
    emitToUser(authUser.id, "report:updated", payloadSocket);
    emitToReportRoom(report.id, "report:updated", payloadSocket);

    return await this.getReportDetail(authUser, report.id);
  }
}

module.exports = EmergencyReportService;
