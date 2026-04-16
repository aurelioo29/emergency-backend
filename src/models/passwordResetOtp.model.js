const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PasswordResetOtp = sequelize.define(
  "PasswordResetOtp",
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
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "phone_number",
    },
    otpHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "otp_hash",
    },
    purpose: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "FORGOT_PASSWORD",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "verified_at",
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "used_at",
    },
    attemptCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "attempt_count",
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "last_sent_at",
    },
  },
  {
    tableName: "password_reset_otps",
    timestamps: true,
    underscored: true,
  },
);

module.exports = PasswordResetOtp;
