const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ambulance = sequelize.define(
  "Ambulance",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    plateNumber: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true,
      field: "plate_number",
    },
    currentLatitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: "current_latitude",
    },
    currentLongitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: "current_longitude",
    },
    status: {
      type: DataTypes.ENUM(
        "AVAILABLE",
        "DISPATCHED",
        "MAINTENANCE",
        "INACTIVE",
      ),
      allowNull: false,
      defaultValue: "AVAILABLE",
    },
  },
  {
    tableName: "ambulances",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Ambulance;
