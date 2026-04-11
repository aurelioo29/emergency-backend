const sequelize = require("../config/database");

const User = require("./user.model");
const EmergencyContact = require("./emergencyContact.model");
const DiseaseHistory = require("./diseaseHistory.model");
const AdminUser = require("./adminUser.model");
const Officer = require("./officer.model");
const Ambulance = require("./ambulance.model");
const Hospital = require("./hospital.model");
const EmergencyReport = require("./emergencyReport.model");
const Dispatch = require("./dispatch.model");
const ReportTrackingLog = require("./reportTrackingLog.model");
const OfficerLocation = require("./officerLocation.model");
const RefreshToken = require("./refreshToken.model");

User.hasMany(EmergencyContact, {
  foreignKey: "user_id",
  as: "emergencyContacts",
});
EmergencyContact.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(DiseaseHistory, { foreignKey: "user_id", as: "diseaseHistories" });
DiseaseHistory.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(EmergencyReport, {
  foreignKey: "user_id",
  as: "emergencyReports",
});
EmergencyReport.belongsTo(User, { foreignKey: "user_id", as: "user" });

Hospital.hasMany(EmergencyReport, {
  foreignKey: "nearest_hospital_id",
  as: "emergencyReports",
});
EmergencyReport.belongsTo(Hospital, {
  foreignKey: "nearest_hospital_id",
  as: "nearestHospital",
});

EmergencyReport.hasMany(Dispatch, {
  foreignKey: "report_id",
  as: "dispatches",
});
Dispatch.belongsTo(EmergencyReport, { foreignKey: "report_id", as: "report" });

Officer.hasMany(Dispatch, { foreignKey: "officer_id", as: "dispatches" });
Dispatch.belongsTo(Officer, { foreignKey: "officer_id", as: "officer" });

Ambulance.hasMany(Dispatch, { foreignKey: "ambulance_id", as: "dispatches" });
Dispatch.belongsTo(Ambulance, { foreignKey: "ambulance_id", as: "ambulance" });

AdminUser.hasMany(Dispatch, { foreignKey: "assigned_by", as: "dispatches" });
Dispatch.belongsTo(AdminUser, {
  foreignKey: "assigned_by",
  as: "assignedByAdmin",
});

EmergencyReport.hasMany(ReportTrackingLog, {
  foreignKey: "report_id",
  as: "trackingLogs",
});
ReportTrackingLog.belongsTo(EmergencyReport, {
  foreignKey: "report_id",
  as: "report",
});

Officer.hasMany(OfficerLocation, { foreignKey: "officer_id", as: "locations" });
OfficerLocation.belongsTo(Officer, { foreignKey: "officer_id", as: "officer" });

EmergencyReport.hasMany(OfficerLocation, {
  foreignKey: "report_id",
  as: "officerLocations",
});
OfficerLocation.belongsTo(EmergencyReport, {
  foreignKey: "report_id",
  as: "report",
});

module.exports = {
  sequelize,
  User,
  EmergencyContact,
  DiseaseHistory,
  AdminUser,
  Officer,
  Ambulance,
  Hospital,
  EmergencyReport,
  Dispatch,
  ReportTrackingLog,
  OfficerLocation,
  RefreshToken,
};
