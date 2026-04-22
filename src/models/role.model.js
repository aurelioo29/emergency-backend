const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roleCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "role_code",
    },
    roleName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "role_name",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "roles",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Role;
