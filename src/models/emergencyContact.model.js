const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmergencyContact = sequelize.define(
  "EmergencyContact",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    contactName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "contact_name",
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "contact_phone",
    },
    relation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "emergency_contacts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  },
);

module.exports = EmergencyContact;
