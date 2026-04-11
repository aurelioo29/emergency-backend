const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DiseaseHistory = sequelize.define(
  "DiseaseHistory",
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
    diseaseName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "disease_name",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "disease_histories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  },
);

module.exports = DiseaseHistory;
