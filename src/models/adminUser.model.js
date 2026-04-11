const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AdminUser = sequelize.define(
  "AdminUser",
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
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "password_hash",
    },
    role: {
      type: DataTypes.ENUM("SUPERADMIN", "DISPATCHER", "ADMIN"),
      allowNull: false,
      defaultValue: "DISPATCHER",
    },
  },
  {
    tableName: "admin_users",
    timestamps: true,
    underscored: true,
  },
);

module.exports = AdminUser;
