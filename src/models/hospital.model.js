const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Hospital = sequelize.define(
  "Hospital",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hospitalName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "hospital_name",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "phone_number",
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "hospitals",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Hospital;
