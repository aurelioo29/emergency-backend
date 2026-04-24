const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serviceCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "service_code",
    },
    serviceName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "service_name",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    iconName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "icon_name",
    },
    iconUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "icon_url",
    },
    colorHex: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "color_hex",
    },
    requiresDispatch: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "requires_dispatch",
    },
    autoAcceptMode: {
      type: DataTypes.ENUM("FULL_AUTO", "CONFIRM", "MANUAL"),
      allowNull: false,
      defaultValue: "CONFIRM",
      field: "auto_accept_mode",
    },
    acceptTimeoutSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
      field: "accept_timeout_seconds",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "services",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Service;
