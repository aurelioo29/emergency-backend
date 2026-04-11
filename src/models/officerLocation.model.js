const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OfficerLocation = sequelize.define(
  "OfficerLocation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    officerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "officer_id",
    },
    reportId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "report_id",
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    recordedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "recorded_at",
    },
  },
  {
    tableName: "officer_locations",
    timestamps: false,
    underscored: true,
  },
);

module.exports = OfficerLocation;
