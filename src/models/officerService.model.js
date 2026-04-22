const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OfficerService = sequelize.define(
  "OfficerService",
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
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "service_id",
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_primary",
    },
  },
  {
    tableName: "officer_services",
    timestamps: true,
    underscored: true,
  },
);

module.exports = OfficerService;
