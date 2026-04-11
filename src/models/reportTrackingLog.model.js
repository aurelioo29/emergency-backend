const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReportTrackingLog = sequelize.define(
  "ReportTrackingLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reportId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "report_id",
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updatedByType: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "updated_by_type",
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "updated_by_id",
    },
  },
  {
    tableName: "report_tracking_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  },
);

module.exports = ReportTrackingLog;
