const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Officer = sequelize.define(
  "Officer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "full_name",
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      field: "phone_number",
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "password_hash",
    },
    // legacy fallback - jangan hapus dulu
    role: {
      type: DataTypes.ENUM(
        "AMBULANCE_DRIVER",
        "PARAMEDIC",
        "FIRE_OFFICER",
        "POLICE",
      ),
      allowNull: false,
    },

    roleId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "role_id",
    },

    status: {
      type: DataTypes.ENUM("AVAILABLE", "ON_DUTY", "OFFLINE"),
      allowNull: false,
      defaultValue: "AVAILABLE",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login_at",
    },
  },
  {
    tableName: "officers",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Officer;
