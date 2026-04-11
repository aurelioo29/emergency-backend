const {
  EmergencyReport,
  ReportTrackingLog,
  Hospital,
  User,
} = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");
const { emitToAdminRoom, emitToUser } = require("../socket/emitter");

class EmergencyReportService {
  static generateReportCode() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);

    return `EMG-${yyyy}${mm}${dd}-${rand}`;
  }

  static async createReport(authUser, payload) {
    const { emergencyType, description, latitude, longitude, addressSnapshot } =
      payload;

    if (authUser.type !== "USER") {
      throw new AppError("Only user can create emergency report", 403);
    }

    const report = await EmergencyReport.create({
      reportCode: this.generateReportCode(),
      userId: authUser.id,
      emergencyType,
      description: description || null,
      latitude,
      longitude,
      addressSnapshot: addressSnapshot || null,
      status: "REPORTED",
      requestedAt: new Date(),
    });

    await ReportTrackingLog.create({
      reportId: report.id,
      status: "REPORTED",
      notes: "Emergency report created by user",
      updatedByType: "USER",
      updatedById: authUser.id,
    });

    emitToAdminRoom("report:new", {
      id: report.id,
      reportCode: report.reportCode,
      userId: report.userId,
      emergencyType: report.emergencyType,
      status: report.status,
      latitude: report.latitude,
      longitude: report.longitude,
      createdAt: report.createdAt,
    });

    emitToUser(authUser.id, "report:created", {
      id: report.id,
      reportCode: report.reportCode,
      emergencyType: report.emergencyType,
      status: report.status,
    });

    return report;
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

    const { count, rows } = await EmergencyReport.findAndCountAll({
      where,
      include: [
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
      "ON_THE_WAY",
      "ARRIVED",
      "HANDLING",
      "COMPLETED",
      "CANCELLED",
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

    if (status === "ARRIVED") {
      updatePayload.arrivedAt = new Date();
    }

    if (status === "COMPLETED") {
      updatePayload.completedAt = new Date();
    }

    await report.update(updatePayload);

    await ReportTrackingLog.create({
      reportId: report.id,
      status,
      notes: notes || `Report status updated to ${status}`,
      updatedByType: "ADMIN",
      updatedById: authUser.id,
    });

    return report;
  }
}

module.exports = EmergencyReportService;
