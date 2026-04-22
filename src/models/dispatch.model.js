const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Dispatch = sequelize.define(
  "Dispatch",
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
    officerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "officer_id",
    },
    ambulanceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "ambulance_id",
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "assigned_by",
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "assigned_at",
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "accepted_at",
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "started_at",
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "finished_at",
    },
    dispatchStatus: {
      type: DataTypes.ENUM(
        "ASSIGNED",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
        "ON_THE_WAY",
        "ARRIVED",
        "COMPLETED",
        "CANCELLED",
      ),
      allowNull: false,
      defaultValue: "ASSIGNED",
      field: "dispatch_status",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "service_id",
    },
    assignmentOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: "assignment_order",
    },
    autoAssigned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "auto_assigned",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "expires_at",
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "rejected_at",
    },
    arrivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "arrived_at",
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "cancelled_at",
    },
  },
  {
    tableName: "dispatches",
    timestamps: false,
    underscored: true,
  },
);

module.exports = Dispatch;
