const { Op } = require("sequelize");
const { OfficerLocation, Dispatch, EmergencyReport } = require("../models");
const AppError = require("../utils/AppError");
const {
  emitToAdminRoom,
  emitToUser,
  emitToOfficer,
  emitToReportRoom,
} = require("../socket/emitter");

class OfficerLocationService {
  static async updateLocation(authUser, payload) {
    if (authUser.type !== "OFFICER") {
      throw new AppError("Only officer can update location", 403);
    }

    const { latitude, longitude, reportId } = payload;

    if (latitude === undefined || longitude === undefined) {
      throw new AppError("Latitude and longitude are required", 400);
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
      throw new AppError("Latitude and longitude must be valid numbers", 400);
    }

    if (parsedLatitude < -90 || parsedLatitude > 90) {
      throw new AppError("Latitude must be between -90 and 90", 400);
    }

    if (parsedLongitude < -180 || parsedLongitude > 180) {
      throw new AppError("Longitude must be between -180 and 180", 400);
    }

    const activeDispatch = await Dispatch.findOne({
      where: {
        officerId: authUser.id,
        dispatchStatus: {
          [Op.in]: ["ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED"],
        },
      },
      include: [
        {
          model: EmergencyReport,
          as: "report",
        },
      ],
      order: [["assignedAt", "DESC"]],
    });

    if (reportId && activeDispatch && reportId !== activeDispatch.reportId) {
      throw new AppError("Invalid reportId for this officer", 400);
    }

    const finalReportId = activeDispatch ? activeDispatch.reportId : null;

    const location = await OfficerLocation.create({
      officerId: authUser.id,
      reportId: finalReportId,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      recordedAt: new Date(),
    });

    if (activeDispatch) {
      emitToUser(activeDispatch.report.userId, "officer:location_updated", {
        reportId: activeDispatch.reportId,
        officerId: authUser.id,
        latitude: location.latitude,
        longitude: location.longitude,
        recordedAt: location.recordedAt,
      });

      emitToAdminRoom("officer:location_updated", {
        reportId: activeDispatch.reportId,
        officerId: authUser.id,
        latitude: location.latitude,
        longitude: location.longitude,
        recordedAt: location.recordedAt,
      });

      emitToReportRoom(activeDispatch.reportId, "officer:location_updated", {
        reportId: activeDispatch.reportId,
        officerId: authUser.id,
        latitude: location.latitude,
        longitude: location.longitude,
        recordedAt: location.recordedAt,
      });
    }

    emitToOfficer(authUser.id, "officer:location_updated", {
      reportId: finalReportId,
      officerId: authUser.id,
      latitude: location.latitude,
      longitude: location.longitude,
      recordedAt: location.recordedAt,
    });

    return location;
  }

  static async getLatestLocationByReport(authUser, reportId) {
    const report = await EmergencyReport.findByPk(reportId);

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    const dispatch = await Dispatch.findOne({
      where: { reportId },
      order: [["assignedAt", "DESC"]],
    });

    if (!dispatch) {
      throw new AppError("No dispatch found for this report", 404);
    }

    if (authUser.type === "USER" && report.userId !== authUser.id) {
      throw new AppError("You are not allowed to access this", 403);
    }

    if (authUser.type === "OFFICER" && dispatch.officerId !== authUser.id) {
      throw new AppError("Not your dispatch", 403);
    }

    const latestLocation = await OfficerLocation.findOne({
      where: { reportId },
      order: [["recordedAt", "DESC"]],
    });

    return latestLocation;
  }

  static async getLocationHistory(authUser, reportId) {
    const report = await EmergencyReport.findByPk(reportId);

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    if (authUser.type === "USER" && report.userId !== authUser.id) {
      throw new AppError("Not allowed", 403);
    }

    if (authUser.type === "OFFICER") {
      const dispatch = await Dispatch.findOne({
        where: {
          reportId,
          officerId: authUser.id,
        },
      });

      if (!dispatch) {
        throw new AppError("Not your dispatch", 403);
      }
    }

    const locations = await OfficerLocation.findAll({
      where: { reportId },
      order: [["recordedAt", "ASC"]],
    });

    return locations;
  }
}

module.exports = OfficerLocationService;
