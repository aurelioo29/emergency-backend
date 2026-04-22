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
  Service,
  OfficerService,
  OfficerLocation,
} = require("../models");
const AppError = require("../utils/AppError");
const {
  emitToAdminRoom,
  emitToUser,
  emitToOfficer,
  emitToReportRoom,
} = require("../socket/emitter");
const { calculateDistanceKm } = require("../utils/distance");

class DispatchService {
  static async createDispatch(authUser, payload) {
    if (authUser.type !== "ADMIN") {
      throw new AppError("Only admin can create dispatch", 403);
    }

    const {
      reportId,
      officerId,
      ambulanceId,
      notes,
      autoAssigned = false,
      assignmentOrder,
      expiresAt,
    } = payload;

    const report = await EmergencyReport.findByPk(reportId, {
      include: [
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

    if (["COMPLETED", "CANCELLED", "FAILED"].includes(report.status)) {
      throw new AppError(
        "Cannot create dispatch for completed, cancelled, or failed report",
        400,
      );
    }

    if (!report.serviceId) {
      throw new AppError("Report does not have serviceId yet", 400);
    }

    const existingActiveDispatch = await Dispatch.findOne({
      where: {
        reportId,
        dispatchStatus: {
          [Op.notIn]: ["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"],
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

    const latestDispatch = await Dispatch.findOne({
      where: { reportId },
      order: [["assignmentOrder", "DESC"]],
    });

    const finalAssignmentOrder =
      assignmentOrder ||
      (latestDispatch ? latestDispatch.assignmentOrder + 1 : 1);

    const dispatch = await Dispatch.create({
      reportId,
      serviceId: report.serviceId,
      officerId: officerId || null,
      ambulanceId: ambulanceId || null,
      assignedBy: authUser.id,
      assignedAt: new Date(),
      dispatchStatus: "ASSIGNED",
      notes: notes || null,
      autoAssigned,
      assignmentOrder: finalAssignmentOrder,
      expiresAt: expiresAt || null,
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
      serviceId: report.serviceId,
      serviceCode: report.service?.serviceCode || null,
      serviceName: report.service?.serviceName || null,
      status: "ASSIGNED",
    });

    if (officer) {
      emitToOfficer(officer.id, "dispatch:new", {
        dispatchId: dispatch.id,
        reportId: report.id,
        reportCode: report.reportCode,
        serviceId: report.serviceId,
        serviceCode: report.service?.serviceCode || null,
        serviceName: report.service?.serviceName || null,
        emergencyType: report.emergencyType, // fallback sementara
        officerId: officer.id,
        autoAssigned,
        assignmentOrder: finalAssignmentOrder,
        expiresAt: dispatch.expiresAt,
      });
    }

    emitToAdminRoom("dispatch:created", {
      dispatchId: dispatch.id,
      reportId: report.id,
      serviceId: report.serviceId,
      officerId: officerId || null,
      ambulanceId: ambulanceId || null,
      status: "ASSIGNED",
      autoAssigned,
      assignmentOrder: finalAssignmentOrder,
    });

    emitToReportRoom(report.id, "report:status_updated", {
      reportId: report.id,
      dispatchId: dispatch.id,
      serviceId: report.serviceId,
      dispatchStatus: "ASSIGNED",
      reportStatus: "ASSIGNED",
    });

    return await this.getDispatchById(dispatch.id);
  }

  static async getTriedOfficerIds(reportId) {
    const previousDispatches = await Dispatch.findAll({
      where: {
        reportId,
        officerId: {
          [Op.not]: null,
        },
      },
      attributes: ["officerId"],
    });

    return [...new Set(previousDispatches.map((item) => item.officerId))];
  }

  static async findNearestAvailableOfficer(report, excludedOfficerIds = []) {
    const officerWhere = {
      status: "AVAILABLE",
      isActive: true,
    };

    if (excludedOfficerIds.length > 0) {
      officerWhere.id = {
        [Op.notIn]: excludedOfficerIds,
      };
    }

    const officerServices = await OfficerService.findAll({
      where: {
        serviceId: report.serviceId,
      },
      include: [
        {
          model: Officer,
          as: "officer",
          required: true,
          where: officerWhere,
        },
        {
          model: Service,
          as: "service",
          required: true,
        },
      ],
    });

    if (!officerServices.length) {
      return null;
    }

    const officerIds = officerServices.map((item) => item.officerId);

    const latestLocationsRaw = await OfficerLocation.findAll({
      where: {
        officerId: {
          [Op.in]: officerIds,
        },
      },
      order: [
        ["officerId", "ASC"],
        ["recordedAt", "DESC"],
      ],
    });

    const latestLocationMap = new Map();

    for (const location of latestLocationsRaw) {
      if (!latestLocationMap.has(location.officerId)) {
        latestLocationMap.set(location.officerId, location);
      }
    }

    let nearest = null;

    for (const officerService of officerServices) {
      const officer = officerService.officer;
      const location = latestLocationMap.get(officer.id);

      if (!location) {
        continue;
      }

      const distanceKm = calculateDistanceKm(
        Number(report.latitude),
        Number(report.longitude),
        Number(location.latitude),
        Number(location.longitude),
      );

      if (!nearest) {
        nearest = {
          officer,
          service: officerService.service,
          location,
          distanceKm,
          isPrimary: officerService.isPrimary,
        };
        continue;
      }

      // Prioritaskan isPrimary kalau jaraknya mirip? Bisa.
      // Untuk sekarang kita pakai jarak paling dekat murni.
      if (distanceKm < nearest.distanceKm) {
        nearest = {
          officer,
          service: officerService.service,
          location,
          distanceKm,
          isPrimary: officerService.isPrimary,
        };
      }
    }

    return nearest;
  }

  static async autoAssignNearestOfficer(report, options = {}) {
    const { excludedOfficerIds = [] } = options;

    const fullReport = await EmergencyReport.findByPk(report.id, {
      include: [
        {
          model: Service,
          as: "service",
          required: false,
        },
      ],
    });

    if (!fullReport) {
      throw new AppError("Emergency report not found", 404);
    }

    if (!fullReport.serviceId) {
      throw new AppError("Report does not have serviceId", 400);
    }

    if (!fullReport.service) {
      throw new AppError("Service not found on report", 400);
    }

    if (!fullReport.service.requiresDispatch) {
      return {
        autoAssigned: false,
        reason: "THIS_SERVICE_DOES_NOT_REQUIRE_DISPATCH",
      };
    }

    const existingActiveDispatch = await Dispatch.findOne({
      where: {
        reportId: fullReport.id,
        dispatchStatus: {
          [Op.notIn]: ["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"],
        },
      },
    });

    if (existingActiveDispatch) {
      return {
        autoAssigned: false,
        reason: "ACTIVE_DISPATCH_ALREADY_EXISTS",
        dispatchId: existingActiveDispatch.id,
      };
    }

    const triedOfficerIds = await this.getTriedOfficerIds(fullReport.id);
    const finalExcludedOfficerIds = [
      ...new Set([...triedOfficerIds, ...excludedOfficerIds]),
    ];

    const nearestOfficerData = await this.findNearestAvailableOfficer(
      fullReport,
      finalExcludedOfficerIds,
    );

    if (!nearestOfficerData) {
      await fullReport.update({
        status: "FAILED",
        failedAt: new Date(),
      });

      await ReportTrackingLog.create({
        reportId: fullReport.id,
        status: "FAILED",
        notes: "No available officer found for this service",
        updatedByType: "SYSTEM",
        updatedById: null,
      });

      emitToAdminRoom("dispatch:auto_assign_failed", {
        reportId: fullReport.id,
        reportCode: fullReport.reportCode,
        serviceId: fullReport.serviceId,
        serviceCode: fullReport.service.serviceCode,
        reason: "NO_AVAILABLE_OFFICER",
      });

      emitToUser(fullReport.userId, "dispatch:auto_assign_failed", {
        reportId: fullReport.id,
        reportCode: fullReport.reportCode,
        serviceId: fullReport.serviceId,
        serviceCode: fullReport.service.serviceCode,
        reason: "NO_AVAILABLE_OFFICER",
      });

      return {
        autoAssigned: false,
        reason: "NO_AVAILABLE_OFFICER",
      };
    }

    const latestDispatch = await Dispatch.findOne({
      where: { reportId: fullReport.id },
      order: [["assignmentOrder", "DESC"]],
    });

    const assignmentOrder = latestDispatch
      ? latestDispatch.assignmentOrder + 1
      : 1;

    const expiresAt =
      fullReport.service.autoAcceptMode === "CONFIRM"
        ? new Date(Date.now() + fullReport.service.acceptTimeoutSeconds * 1000)
        : null;

    const initialDispatchStatus =
      fullReport.service.autoAcceptMode === "FULL_AUTO"
        ? "ACCEPTED"
        : "ASSIGNED";

    const dispatch = await Dispatch.create({
      reportId: fullReport.id,
      serviceId: fullReport.serviceId,
      officerId: nearestOfficerData.officer.id,
      ambulanceId: null,
      assignedBy: null,
      assignedAt: new Date(),
      acceptedAt: initialDispatchStatus === "ACCEPTED" ? new Date() : null,
      dispatchStatus: initialDispatchStatus,
      autoAssigned: true,
      assignmentOrder,
      expiresAt,
      notes: `Auto assigned by system. Distance ${nearestOfficerData.distanceKm.toFixed(
        2,
      )} km`,
    });

    await fullReport.update({
      status: initialDispatchStatus === "ACCEPTED" ? "ACCEPTED" : "ASSIGNED",
      assignedAt: new Date(),
      acceptedAt: initialDispatchStatus === "ACCEPTED" ? new Date() : null,
      failedAt: null,
    });

    await nearestOfficerData.officer.update({
      status: "ON_DUTY",
    });

    await ReportTrackingLog.create({
      reportId: fullReport.id,
      status: initialDispatchStatus === "ACCEPTED" ? "ACCEPTED" : "ASSIGNED",
      notes: `Auto assigned to officer ${nearestOfficerData.officer.fullName} (${nearestOfficerData.distanceKm.toFixed(
        2,
      )} km)`,
      updatedByType: "SYSTEM",
      updatedById: null,
    });

    emitToUser(fullReport.userId, "dispatch:assigned", {
      reportId: fullReport.id,
      reportCode: fullReport.reportCode,
      dispatchId: dispatch.id,
      serviceId: fullReport.serviceId,
      serviceCode: fullReport.service.serviceCode,
      serviceName: fullReport.service.serviceName,
      status: initialDispatchStatus,
      officerId: nearestOfficerData.officer.id,
      officerName: nearestOfficerData.officer.fullName,
      distanceKm: nearestOfficerData.distanceKm,
      expiresAt,
    });

    emitToOfficer(nearestOfficerData.officer.id, "dispatch:new", {
      dispatchId: dispatch.id,
      reportId: fullReport.id,
      reportCode: fullReport.reportCode,
      serviceId: fullReport.serviceId,
      serviceCode: fullReport.service.serviceCode,
      serviceName: fullReport.service.serviceName,
      officerId: nearestOfficerData.officer.id,
      officerName: nearestOfficerData.officer.fullName,
      distanceKm: nearestOfficerData.distanceKm,
      autoAssigned: true,
      assignmentOrder,
      expiresAt,
      dispatchStatus: initialDispatchStatus,
    });

    emitToAdminRoom("dispatch:auto_assigned", {
      dispatchId: dispatch.id,
      reportId: fullReport.id,
      reportCode: fullReport.reportCode,
      serviceId: fullReport.serviceId,
      officerId: nearestOfficerData.officer.id,
      officerName: nearestOfficerData.officer.fullName,
      distanceKm: nearestOfficerData.distanceKm,
      dispatchStatus: initialDispatchStatus,
      assignmentOrder,
      expiresAt,
    });

    emitToReportRoom(fullReport.id, "report:status_updated", {
      reportId: fullReport.id,
      dispatchId: dispatch.id,
      serviceId: fullReport.serviceId,
      dispatchStatus: initialDispatchStatus,
      reportStatus:
        initialDispatchStatus === "ACCEPTED" ? "ACCEPTED" : "ASSIGNED",
    });

    return await this.getDispatchById(dispatch.id);
  }

  static async reassignNextNearestOfficer(reportId) {
    const report = await EmergencyReport.findByPk(reportId);

    if (!report) {
      throw new AppError("Emergency report not found", 404);
    }

    return await this.autoAssignNearestOfficer(report);
  }

  static async expireDispatch(dispatchId) {
    const dispatch = await Dispatch.findByPk(dispatchId, {
      include: [
        { model: EmergencyReport, as: "report" },
        { model: Officer, as: "officer", required: false },
      ],
    });

    if (!dispatch) {
      throw new AppError("Dispatch not found", 404);
    }

    if (dispatch.dispatchStatus !== "ASSIGNED") {
      return dispatch;
    }

    await dispatch.update({
      dispatchStatus: "EXPIRED",
    });

    if (dispatch.officer) {
      await dispatch.officer.update({
        status: "AVAILABLE",
      });
    }

    await dispatch.report.update({
      status: "REPORTED",
    });

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: "REPORTED",
      notes: "Dispatch expired, reassigning next nearest officer",
      updatedByType: "SYSTEM",
      updatedById: null,
    });

    emitToAdminRoom("dispatch:expired", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      officerId: dispatch.officerId,
      serviceId: dispatch.serviceId,
    });

    return await this.reassignNextNearestOfficer(dispatch.report.id);
  }

  static async rejectDispatch(authUser, dispatchId, payload = {}) {
    if (authUser.type !== "OFFICER") {
      throw new AppError("Only officer can reject dispatch", 403);
    }

    const dispatch = await this.getOfficerOwnedDispatch(
      authUser.id,
      dispatchId,
    );

    if (dispatch.dispatchStatus !== "ASSIGNED") {
      throw new AppError("Only ASSIGNED dispatch can be rejected", 400);
    }

    await dispatch.update({
      dispatchStatus: "REJECTED",
      rejectedAt: new Date(),
      notes: payload.notes || dispatch.notes,
    });

    await dispatch.report.update({
      status: "REPORTED",
      acceptedAt: null,
    });

    if (dispatch.officer) {
      await dispatch.officer.update({
        status: "AVAILABLE",
      });
    }

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: "REPORTED",
      notes:
        payload.notes ||
        "Dispatch rejected by officer, trying next nearest officer",
      updatedByType: "OFFICER",
      updatedById: authUser.id,
    });

    emitToAdminRoom("dispatch:rejected", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      officerId: dispatch.officerId,
      serviceId: dispatch.serviceId,
    });

    return await this.reassignNextNearestOfficer(dispatch.report.id);
  }

  static async getDispatchById(dispatchId) {
    return Dispatch.findByPk(dispatchId, {
      include: [
        {
          model: EmergencyReport,
          as: "report",
          attributes: [
            "id",
            "reportCode",
            "status",
            "emergencyType",
            "serviceId",
            "userId",
          ],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "serviceCode", "serviceName"],
              required: false,
            },
          ],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "serviceCode", "serviceName"],
          required: false,
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

    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    const { count, rows } = await Dispatch.findAndCountAll({
      where,
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "serviceCode", "serviceName"],
          required: false,
        },
        {
          model: EmergencyReport,
          as: "report",
          attributes: [
            "id",
            "reportCode",
            "status",
            "emergencyType",
            "serviceId",
          ],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "serviceCode", "serviceName"],
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
          model: Service,
          as: "service",
          attributes: ["id", "serviceCode", "serviceName"],
          required: false,
        },
        {
          model: EmergencyReport,
          as: "report",
          attributes: [
            "id",
            "reportCode",
            "status",
            "emergencyType",
            "serviceId",
          ],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "serviceCode", "serviceName"],
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
      "REJECTED",
      "EXPIRED",
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
      reportStatus = "ACCEPTED";
    }

    if (dispatchStatus === "REJECTED") {
      updatePayload.rejectedAt = new Date();
      reportStatus = "REPORTED";
    }

    if (dispatchStatus === "EXPIRED") {
      reportStatus = "REPORTED";
    }

    if (dispatchStatus === "ON_THE_WAY" && !dispatch.startedAt) {
      updatePayload.startedAt = new Date();
      reportStatus = "ON_THE_WAY";
    }

    if (dispatchStatus === "ARRIVED") {
      updatePayload.arrivedAt = new Date();
      reportStatus = "ARRIVED";
    }

    if (dispatchStatus === "COMPLETED") {
      updatePayload.finishedAt = new Date();
      reportStatus = "COMPLETED";
    }

    if (dispatchStatus === "CANCELLED") {
      updatePayload.cancelledAt = new Date();
      reportStatus = "CANCELLED";
    }

    await dispatch.update(updatePayload);

    const reportUpdatePayload = {
      status: reportStatus,
    };

    if (reportStatus === "ACCEPTED") {
      reportUpdatePayload.acceptedAt = new Date();
    }

    if (reportStatus === "ARRIVED") {
      reportUpdatePayload.arrivedAt = new Date();
    }

    if (reportStatus === "COMPLETED") {
      reportUpdatePayload.completedAt = new Date();
    }

    if (reportStatus === "CANCELLED") {
      reportUpdatePayload.cancelledAt = new Date();
    }

    await dispatch.report.update(reportUpdatePayload);

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: reportStatus,
      notes: notes || `Dispatch status updated to ${dispatchStatus} by admin`,
      updatedByType: "ADMIN",
      updatedById: authUser.id,
    });

    if (
      ["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"].includes(dispatchStatus)
    ) {
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
      serviceId: dispatch.serviceId,
      dispatchStatus,
      reportStatus,
    });

    if (dispatch.officerId) {
      emitToOfficer(dispatch.officerId, "dispatch:status_updated", {
        dispatchId: dispatch.id,
        reportId: dispatch.report.id,
        serviceId: dispatch.serviceId,
        dispatchStatus,
        reportStatus,
      });
    }

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus,
      reportStatus,
    });

    emitToReportRoom(dispatch.report.id, "report:status_updated", {
      reportId: dispatch.report.id,
      dispatchId: dispatch.id,
      serviceId: dispatch.serviceId,
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

    await dispatch.report.update({
      status: "ACCEPTED",
      acceptedAt: new Date(),
    });

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: "ACCEPTED",
      notes: "Dispatch accepted by officer",
      updatedByType: "OFFICER",
      updatedById: authUser.id,
    });

    emitToUser(dispatch.report.userId, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus: "ACCEPTED",
      reportStatus: "ACCEPTED",
    });

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus: "ACCEPTED",
      reportStatus: "ACCEPTED",
    });

    emitToReportRoom(dispatch.report.id, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus: "ACCEPTED",
      reportStatus: "ACCEPTED",
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

    const nextDispatchStatus =
      dispatch.dispatchStatus === "ASSIGNED"
        ? "ACCEPTED"
        : dispatch.dispatchStatus;

    await dispatch.update({
      dispatchStatus: "ON_THE_WAY",
      acceptedAt: dispatch.acceptedAt || new Date(),
      startedAt: new Date(),
    });

    await dispatch.report.update({
      status: "ON_THE_WAY",
      acceptedAt: dispatch.report.acceptedAt || new Date(),
    });

    await ReportTrackingLog.create({
      reportId: dispatch.report.id,
      status: "ON_THE_WAY",
      notes:
        nextDispatchStatus === "ASSIGNED"
          ? "Officer accepted and is on the way"
          : "Officer is on the way",
      updatedByType: "OFFICER",
      updatedById: authUser.id,
    });

    emitToUser(dispatch.report.userId, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus: "ON_THE_WAY",
      reportStatus: "ON_THE_WAY",
    });

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus: "ON_THE_WAY",
      reportStatus: "ON_THE_WAY",
    });

    emitToReportRoom(dispatch.report.id, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
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
      arrivedAt: new Date(),
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
      serviceId: dispatch.serviceId,
      dispatchStatus: "ARRIVED",
      reportStatus: "ARRIVED",
    });

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus: "ARRIVED",
      reportStatus: "ARRIVED",
    });

    emitToReportRoom(dispatch.report.id, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
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
      serviceId: dispatch.serviceId,
      dispatchStatus: "COMPLETED",
      reportStatus: "COMPLETED",
    });

    emitToAdminRoom("dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus: "COMPLETED",
      reportStatus: "COMPLETED",
    });

    emitToReportRoom(dispatch.report.id, "dispatch:status_updated", {
      dispatchId: dispatch.id,
      reportId: dispatch.report.id,
      serviceId: dispatch.serviceId,
      dispatchStatus: "COMPLETED",
      reportStatus: "COMPLETED",
    });

    return await this.getDispatchById(dispatch.id);
  }
}

module.exports = DispatchService;
