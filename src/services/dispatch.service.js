const { Op } = require("sequelize");
const {
  Dispatch,
  EmergencyReport,
  Officer,
  Ambulance,
  AdminUser,
  ReportTrackingLog,
  User,
  Hospital,
} = require("../models");
const AppError = require("../utils/AppError");
const {
  emitToAdminRoom,
  emitToUser,
  emitToOfficer,
  emitToReportRoom,
} = require("../socket/emitter");

class DispatchService {
  static async createDispatch(authUser, payload) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can create dispatch", 403);
    }

    const { reportId, officerId, ambulanceId, notes } = payload;

    if (!reportId) {
      throw new AppError("reportId is required", 400);
    }

    const report = await EmergencyReport.findByPk(reportId);

    if (!report) {
      throw new AppError("Emergency report not found", 404);
    }

    if (["COMPLETED", "CANCELLED"].includes(report.status)) {
      throw new AppError(
        "Cannot create dispatch for completed or cancelled report",
        400,
      );
    }

    const existingActiveDispatch = await Dispatch.findOne({
      where: {
        reportId,
        dispatchStatus: {
          [Op.notIn]: ["COMPLETED", "CANCELLED"],
        },
      },
    });

    if (existingActiveDispatch) {
      throw new AppError("This report already has an active dispatch", 409);
    }

    let officer = null;
    if (officerId) {
      officer = await Officer.findByPk(officerId);

      if (!officer) {
        throw new AppError("Officer not found", 404);
      }

      if (!officer.isActive) {
        throw new AppError("Officer account is inactive", 400);
      }

      if (officer.status === "OFFLINE") {
        throw new AppError("Officer is offline", 400);
      }

      if (officer.status === "ON_DUTY") {
        throw new AppError("Officer is already on duty", 400);
      }
    }

    let ambulance = null;
    if (ambulanceId) {
      ambulance = await Ambulance.findByPk(ambulanceId);

      if (!ambulance) {
        throw new AppError("Ambulance not found", 404);
      }

      if (ambulance.status === "MAINTENANCE") {
        throw new AppError("Ambulance is under maintenance", 400);
      }

      if (ambulance.status === "DISPATCHED") {
        throw new AppError("Ambulance is already dispatched", 400);
      }
    }

    const dispatch = await Dispatch.create({
      reportId,
      officerId: officerId || null,
      ambulanceId: ambulanceId || null,
      assignedBy: authUser.id,
      assignedAt: new Date(),
      dispatchStatus: "ASSIGNED",
      notes: notes || null,
    });

    await report.update({
      status: "ASSIGNED",
      assignedAt: new Date(),
    });

    await ReportTrackingLog.create({
      reportId: report.id,
      status: "ASSIGNED",
      notes: notes || "Dispatch created and resources assigned by admin",
      updatedByType: "ADMIN",
      updatedById: authUser.id,
    });

    if (officer) {
      await officer.update({
        status: "ON_DUTY",
      });
    }

    if (ambulance) {
      await ambulance.update({
        status: "DISPATCHED",
      });
    }

    emitToUser(report.userId, "dispatch:assigned", {
      reportId: report.id,
      reportCode: report.reportCode,
      dispatchId: dispatch.id,
      status: "ASSIGNED",
    });

    if (officer) {
      emitToOfficer(officer.id, "dispatch:new", {
        dispatchId: dispatch.id,
        reportId: report.id,
        reportCode: report.reportCode,
        emergencyType: report.emergencyType,
        officerId: officer.id,
      });
    }

    emitToAdminRoom("dispatch:created", {
      dispatchId: dispatch.id,
      reportId: report.id,
      officerId: officerId || null,
      ambulanceId: ambulanceId || null,
      status: "ASSIGNED",
    });

    emitToReportRoom(report.id, "report:status_updated", {
      reportId: report.id,
      dispatchId: dispatch.id,
      dispatchStatus: "ASSIGNED",
      reportStatus: "ASSIGNED",
    });

    return await this.getDispatchById(dispatch.id);
  }

  static async getDispatchById(dispatchId) {
    return Dispatch.findByPk(dispatchId, {
      include: [
        {
          model: EmergencyReport,
          as: "report",
          attributes: ["id", "reportCode", "status", "emergencyType", "userId"],
        },
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
            "isActive",
          ],
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
    });
  }

  static async getAllDispatches(authUser, query) {
    // if (authUser.type !== "ADMIN") {
    //   throw new AppError("Only admin can access all dispatches", 403);
    // }

    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (query.dispatchStatus) {
      where.dispatchStatus = query.dispatchStatus;
    }

    if (query.reportId) {
      where.reportId = query.reportId;
    }

    if (query.officerId) {
      where.officerId = query.officerId;
    }

    if (query.ambulanceId) {
      where.ambulanceId = query.ambulanceId;
    }

    const { count, rows } = await Dispatch.findAndCountAll({
      where,
      include: [
        {
          model: EmergencyReport,
          as: "report",
          attributes: ["id", "reportCode", "status", "emergencyType"],
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
      order: [["assignedAt", "DESC"]],
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

  static async getDispatchesByReport(authUser, reportId) {
    const report = await EmergencyReport.findByPk(reportId);

    if (!report) {
      throw new AppError("Emergency report not found", 404);
    }

    if (authUser.type === "USER" && report.userId !== authUser.id) {
      throw new AppError("You are not allowed to access this report", 403);
    }

    if (authUser.type === "OFFICER") {
      const ownedDispatch = await Dispatch.findOne({
        where: {
          reportId,
          officerId: authUser.id,
        },
      });

      if (!ownedDispatch) {
        throw new AppError("You are not assigned to this report", 403);
      }
    }

    const dispatches = await Dispatch.findAll({
      where: { reportId },
      include: [
        {
          model: EmergencyReport,
          as: "report",
          attributes: ["id", "reportCode", "status", "emergencyType"],
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
      order: [["assignedAt", "DESC"]],
    });

    return dispatches;
  }

  static async updateDispatchStatus(authUser, dispatchId, payload) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can update dispatch status", 403);
    }

    const { dispatchStatus, notes } = payload;

    const allowedStatuses = [
      "ASSIGNED",
      "ACCEPTED",
      "ON_THE_WAY",
      "ARRIVED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(dispatchStatus)) {
      throw new AppError("Invalid dispatch status", 400);
    }

    const dispatch = await Dispatch.findByPk(dispatchId, {
      include: [
        { model: EmergencyReport, as: "report" },
        { model: Officer, as: "officer", required: false },
        { model: Ambulance, as: "ambulance", required: false },
      ],
    });

    if (!dispatch) {
      throw new AppError("Dispatch not found", 404);
    }

    const updatePayload = {
      dispatchStatus,
      notes: notes || dispatch.notes,
    };

    let reportStatus = dispatch.report.status;

    if (dispatchStatus === "ACCEPTED" && !dispatch.acceptedAt) {
      updatePayload.acceptedAt = new Date();
      reportStatus = "ASSIGNED";
    }

    if (dispatchStatus === "ON_THE_WAY" && !dispatch.startedAt) {
      updatePayload.startedAt = new Date();
      reportStatus = "ON_THE_WAY";
    }

    if (dispatchStatus === "ARRIVED") {
      reportStatus = "ARRIVED";
    }

    if (dispatchStatus === "COMPLETED") {
      updatePayload.finishedAt = new Date();
      reportStatus = "COMPLETED";
    }

    if (dispatchStatus === "CANCELLED") {
      reportStatus = "REPORTED";
    }

    await dispatch.update(updatePayload);

    const reportUpdatePayload = {
      status: reportStatus,
    };

    if (reportStatus === "ARRIVED") {
      reportUpdatePayload.arrivedAt = new Date();
    }

    if (reportStatus === "COMPLETED") {
      reportUpdatePayload.completedAt = new Date();
    }

    await dispatch.report.update(reportUpdatePayload);

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: reportStatus,
      notes: notes || `Dispatch status updated to ${dispatchStatus} by admin`,
      updatedByType: "ADMIN",
      updatedById: authUser.id,
    });

    if (["COMPLETED", "CANCELLED"].includes(dispatchStatus)) {
      if (dispatch.officer) {
        await dispatch.officer.update({
          status: "AVAILABLE",
        });
      }

      if (dispatch.ambulance) {
        await dispatch.ambulance.update({
          status: "AVAILABLE",
        });
      }
    }

    emitToUser(dispatch.report.userId, "report:status_updated", {
      reportId: dispatch.report.id,
      dispatchId: dispatch.id,
      dispatchStatus,
      reportStatus,
    });

    if (dispatch.officerId) {
      emitToOfficer(dispatch.officerId, "dispatch:status_updated", {
        dispatchId: dispatch.id,
        reportId: dispatch.report.id,
        dispatchStatus,
        reportStatus,
      });
    }

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus,
      reportStatus,
    });

    emitToReportRoom(dispatch.report.id, "report:status_updated", {
      reportId: dispatch.report.id,
      dispatchId: dispatch.id,
      dispatchStatus,
      reportStatus,
    });

    return await this.getDispatchById(dispatch.id);
  }

  static async getOfficerOwnedDispatch(officerId, dispatchId) {
    const dispatch = await Dispatch.findByPk(dispatchId, {
      include: [
        { model: EmergencyReport, as: "report" },
        { model: Officer, as: "officer", required: false },
        { model: Ambulance, as: "ambulance", required: false },
      ],
    });

    if (!dispatch) {
      throw new AppError("Dispatch not found", 404);
    }

    if (!dispatch.officerId || dispatch.officerId !== officerId) {
      throw new AppError("You are not assigned to this dispatch", 403);
    }

    return dispatch;
  }

  static async acceptDispatch(authUser, dispatchId) {
    if (authUser.type !== "OFFICER") {
      throw new AppError("Only officer can accept dispatch", 403);
    }

    const dispatch = await this.getOfficerOwnedDispatch(
      authUser.id,
      dispatchId,
    );

    if (dispatch.dispatchStatus !== "ASSIGNED") {
      throw new AppError("Only ASSIGNED dispatch can be accepted", 400);
    }

    await dispatch.update({
      dispatchStatus: "ACCEPTED",
      acceptedAt: new Date(),
    });

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: "ASSIGNED",
      notes: "Dispatch accepted by officer",
      updatedByType: "OFFICER",
      updatedById: authUser.id,
    });

    emitToUser(dispatch.report.userId, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ACCEPTED",
      reportStatus: dispatch.report.status,
    });

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ACCEPTED",
      reportStatus: dispatch.report.status,
    });

    emitToReportRoom(dispatch.report.id, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ACCEPTED",
      reportStatus: dispatch.report.status,
    });

    return await this.getDispatchById(dispatch.id);
  }

  static async startDispatch(authUser, dispatchId) {
    if (authUser.type !== "OFFICER") {
      throw new AppError("Only officer can start dispatch", 403);
    }

    const dispatch = await this.getOfficerOwnedDispatch(
      authUser.id,
      dispatchId,
    );

    if (!["ACCEPTED", "ASSIGNED"].includes(dispatch.dispatchStatus)) {
      throw new AppError(
        "Only ASSIGNED or ACCEPTED dispatch can be started",
        400,
      );
    }

    await dispatch.update({
      dispatchStatus: "ON_THE_WAY",
      startedAt: new Date(),
    });

    await dispatch.report.update({
      status: "ON_THE_WAY",
    });

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: "ON_THE_WAY",
      notes: "Officer is on the way",
      updatedByType: "OFFICER",
      updatedById: authUser.id,
    });

    emitToUser(dispatch.report.userId, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ON_THE_WAY",
      reportStatus: "ON_THE_WAY",
    });

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ON_THE_WAY",
      reportStatus: "ON_THE_WAY",
    });

    emitToReportRoom(dispatch.report.id, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ON_THE_WAY",
      reportStatus: "ON_THE_WAY",
    });

    return await this.getDispatchById(dispatch.id);
  }

  static async arriveDispatch(authUser, dispatchId) {
    if (authUser.type !== "OFFICER") {
      throw new AppError("Only officer can mark arrival", 403);
    }

    const dispatch = await this.getOfficerOwnedDispatch(
      authUser.id,
      dispatchId,
    );

    if (dispatch.dispatchStatus !== "ON_THE_WAY") {
      throw new AppError("Only ON_THE_WAY dispatch can be marked arrived", 400);
    }

    await dispatch.update({
      dispatchStatus: "ARRIVED",
    });

    await dispatch.report.update({
      status: "ARRIVED",
      arrivedAt: new Date(),
    });

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: "ARRIVED",
      notes: "Officer arrived at location",
      updatedByType: "OFFICER",
      updatedById: authUser.id,
    });

    emitToUser(dispatch.report.userId, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ARRIVED",
      reportStatus: "ARRIVED",
    });

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ARRIVED",
      reportStatus: "ARRIVED",
    });

    emitToReportRoom(dispatch.report.id, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "ARRIVED",
      reportStatus: "ARRIVED",
    });

    return await this.getDispatchById(dispatch.id);
  }

  static async completeDispatch(authUser, dispatchId, payload) {
    if (authUser.type !== "OFFICER") {
      throw new AppError("Only officer can complete dispatch", 403);
    }

    const { notes } = payload || {};

    const dispatch = await this.getOfficerOwnedDispatch(
      authUser.id,
      dispatchId,
    );

    if (!["ARRIVED", "ON_THE_WAY"].includes(dispatch.dispatchStatus)) {
      throw new AppError(
        "Only ARRIVED or ON_THE_WAY dispatch can be completed",
        400,
      );
    }

    await dispatch.update({
      dispatchStatus: "COMPLETED",
      finishedAt: new Date(),
      notes: notes || dispatch.notes,
    });

    await dispatch.report.update({
      status: "COMPLETED",
      completedAt: new Date(),
    });

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: "COMPLETED",
      notes: notes || "Dispatch completed by officer",
      updatedByType: "OFFICER",
      updatedById: authUser.id,
    });

    if (dispatch.officer) {
      await dispatch.officer.update({
        status: "AVAILABLE",
      });
    }

    if (dispatch.ambulance) {
      await dispatch.ambulance.update({
        status: "AVAILABLE",
      });
    }

    emitToUser(dispatch.report.userId, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "COMPLETED",
      reportStatus: "COMPLETED",
    });

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "COMPLETED",
      reportStatus: "COMPLETED",
    });

    emitToReportRoom(dispatch.report.id, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      dispatchStatus: "COMPLETED",
      reportStatus: "COMPLETED",
    });

    return await this.getDispatchById(dispatch.id);
  }
}

module.exports = DispatchService;
