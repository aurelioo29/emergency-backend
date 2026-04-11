const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmergencyReport = sequelize.define(
  "EmergencyReport",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reportCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "report_code",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    nearestHospitalId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "nearest_hospital_id",
    },
    emergencyType: {
      type: DataTypes.ENUM("SOS", "AMBULANCE", "FIRE", "CRIME"),
      allowNull: false,
      field: "emergency_type",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    addressSnapshot: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "address_snapshot",
    },
    status: {
      type: DataTypes.ENUM(
        "REPORTED",
        "ASSIGNED",
        "ON_THE_WAY",
        "ARRIVED",
        "HANDLING",
        "COMPLETED",
        "CANCELLED",
      ),
      allowNull: false,
      defaultValue: "REPORTED",
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "requested_at",
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "assigned_at",
    },
    arrivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "arrived_at",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completed_at",
    },
  },
  {
    tableName: "emergency_reports",
    timestamps: true,
    underscored: true,
  },
);

module.exports = EmergencyReport;
