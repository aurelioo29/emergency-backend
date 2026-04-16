const {
  User,
  AdminUser,
  Officer,
  RefreshToken,
  PasswordResetOtp,
  sequelize,
} = require("../models");
const { hashPassword, comparePassword } = require("../utils/hash");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const AppError = require("../utils/AppError");
const FonnteService = require("./fonnte.service");

class AuthService {
  static getRefreshTokenExpiryDate() {
    const raw = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    const now = new Date();

    if (raw.endsWith("d")) {
      const days = Number(raw.replace("d", ""));
      now.setDate(now.getDate() + days);
      return now;
    }

    if (raw.endsWith("h")) {
      const hours = Number(raw.replace("h", ""));
      now.setHours(now.getHours() + hours);
      return now;
    }

    if (raw.endsWith("m")) {
      const minutes = Number(raw.replace("m", ""));
      now.setMinutes(now.getMinutes() + minutes);
      return now;
    }

    now.setDate(now.getDate() + 7);
    return now;
  }

  static getOtpExpiryDate() {
    const minutes = Number(
      process.env.FORGOT_PASSWORD_OTP_EXPIRES_MINUTES || 5,
    );

    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);

    return now;
  }

  static generateOtp(length = 6) {
    let otp = "";
    for (let i = 0; i < length; i += 1) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  static normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return "";

    let normalized = phoneNumber.toString().replace(/\D/g, "");

    if (normalized.startsWith("0")) {
      normalized = `62${normalized.slice(1)}`;
    } else if (normalized.startsWith("8")) {
      normalized = `62${normalized}`;
    }

    return normalized;
  }

  static maskPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length < 4) return phoneNumber;
    return `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-3)}`;
  }

  static async saveRefreshToken({
    ownerType,
    ownerId,
    token,
    transaction = null,
  }) {
    return RefreshToken.create(
      {
        ownerType,
        ownerId,
        token,
        expiresAt: this.getRefreshTokenExpiryDate(),
      },
      transaction ? { transaction } : {},
    );
  }

  static async register(payload) {
    const { fullName, nik, phoneNumber, address, password } = payload;

    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    const existingPhone = await User.findOne({
      where: { phoneNumber: normalizedPhone },
    });

    if (existingPhone) {
      throw new AppError("Phone number already registered", 409);
    }

    const existingNik = await User.findOne({
      where: { nik },
    });

    if (existingNik) {
      throw new AppError("NIK already registered", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      fullName,
      nik,
      phoneNumber: normalizedPhone,
      address,
      passwordHash,
    });

    return {
      id: user.id,
      fullName: user.fullName,
      nik: user.nik,
      phoneNumber: user.phoneNumber,
      address: user.address,
      createdAt: user.createdAt,
    };
  }

  static async loginUser(payload) {
    const { phoneNumber, password } = payload;
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    const user = await User.findOne({
      where: { phoneNumber: normalizedPhone },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError("Invalid password", 401);
    }

    const tokenPayload = {
      id: user.id,
      role: "USER",
      type: "USER",
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await this.saveRefreshToken({
      ownerType: "USER",
      ownerId: user.id,
      token: refreshToken,
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        nik: user.nik,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
      accessToken,
      refreshToken,
    };
  }

  static async loginAdmin(payload) {
    const { email, password } = payload;

    const admin = await AdminUser.findOne({
      where: { email },
    });

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    const isValidPassword = await comparePassword(password, admin.passwordHash);

    if (!isValidPassword) {
      throw new AppError("Invalid password", 401);
    }

    const tokenPayload = {
      id: admin.id,
      role: admin.role,
      type: "ADMIN",
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await this.saveRefreshToken({
      ownerType: "ADMIN",
      ownerId: admin.id,
      token: refreshToken,
    });

    return {
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async loginOfficer(payload) {
    const { email, password } = payload;

    const officer = await Officer.findOne({
      where: { email },
    });

    if (!officer) {
      throw new AppError("Officer not found", 404);
    }

    if (!officer.isActive) {
      throw new AppError("Officer account is inactive", 403);
    }

    if (!officer.passwordHash) {
      throw new AppError("Officer password is not set", 400);
    }

    const isValidPassword = await comparePassword(
      password,
      officer.passwordHash,
    );

    if (!isValidPassword) {
      throw new AppError("Invalid password", 401);
    }

    await officer.update({
      lastLoginAt: new Date(),
    });

    const tokenPayload = {
      id: officer.id,
      role: officer.role,
      type: "OFFICER",
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await this.saveRefreshToken({
      ownerType: "OFFICER",
      ownerId: officer.id,
      token: refreshToken,
    });

    return {
      officer: {
        id: officer.id,
        fullName: officer.fullName,
        email: officer.email,
        phoneNumber: officer.phoneNumber,
        role: officer.role,
        status: officer.status,
        isActive: officer.isActive,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(payload) {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 422);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const storedToken = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        revokedAt: null,
      },
    });

    if (!storedToken) {
      throw new AppError("Refresh token not found or already revoked", 401);
    }

    if (new Date(storedToken.expiresAt) < new Date()) {
      throw new AppError("Refresh token has expired", 401);
    }

    const newPayload = {
      id: decoded.id,
      role: decoded.role,
      type: decoded.type,
    };

    const newAccessToken = generateAccessToken(newPayload);

    return {
      accessToken: newAccessToken,
      refreshToken,
    };
  }

  static async logout(authUser, payload) {
    const { refreshToken } = payload;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 422);
    }

    const storedToken = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        ownerType: authUser.type,
        ownerId: authUser.id,
        revokedAt: null,
      },
    });

    if (!storedToken) {
      throw new AppError("Refresh token not found or already revoked", 404);
    }

    await storedToken.update({
      revokedAt: new Date(),
    });

    return {
      loggedOut: true,
    };
  }

  static async getCurrentUser(authUser) {
    if (authUser.type === "ADMIN") {
      const admin = await AdminUser.findByPk(authUser.id);

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      return {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        type: "ADMIN",
      };
    }

    if (authUser.type === "OFFICER") {
      const officer = await Officer.findByPk(authUser.id);

      if (!officer) {
        throw new AppError("Officer not found", 404);
      }

      return {
        id: officer.id,
        fullName: officer.fullName,
        email: officer.email,
        phoneNumber: officer.phoneNumber,
        role: officer.role,
        status: officer.status,
        isActive: officer.isActive,
        type: "OFFICER",
      };
    }

    const user = await User.findByPk(authUser.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user.id,
      fullName: user.fullName,
      nik: user.nik,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: "USER",
      type: "USER",
    };
  }

  static async requestForgotPasswordOtp(payload) {
    const rawPhone = payload.phoneNumber;
    const phoneNumber = this.normalizePhoneNumber(rawPhone);

    const user = await User.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError("Phone number is not registered", 404);
    }

    const existingActiveOtp = await PasswordResetOtp.findOne({
      where: {
        phoneNumber,
        purpose: "FORGOT_PASSWORD",
        usedAt: null,
      },
      order: [["createdAt", "DESC"]],
    });

    const cooldownSeconds = Number(
      process.env.FORGOT_PASSWORD_OTP_RESEND_COOLDOWN_SECONDS || 60,
    );

    if (
      existingActiveOtp &&
      existingActiveOtp.lastSentAt &&
      new Date(existingActiveOtp.lastSentAt).getTime() +
        cooldownSeconds * 1000 >
        Date.now()
    ) {
      throw new AppError(
        `Please wait ${cooldownSeconds} seconds before requesting another OTP`,
        429,
      );
    }

    const otp = this.generateOtp(6);
    const otpHash = await hashPassword(otp);
    const expiresAt = this.getOtpExpiryDate();

    const transaction = await sequelize.transaction();

    try {
      await PasswordResetOtp.update(
        {
          usedAt: new Date(),
        },
        {
          where: {
            phoneNumber,
            purpose: "FORGOT_PASSWORD",
            usedAt: null,
          },
          transaction,
        },
      );

      await PasswordResetOtp.create(
        {
          userId: user.id,
          phoneNumber,
          otpHash,
          purpose: "FORGOT_PASSWORD",
          expiresAt,
          lastSentAt: new Date(),
        },
        { transaction },
      );

      const message = `Kode OTP reset password Anda adalah: ${otp}\n\nBerlaku selama 5 menit.\nJangan bagikan kode ini kepada siapa pun.`;

      await FonnteService.sendWhatsapp({
        target: phoneNumber,
        message,
      });

      await transaction.commit();

      const expiresMinutes = Number(
        process.env.FORGOT_PASSWORD_OTP_EXPIRES_MINUTES || 5,
      );

      return {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        expiresInSeconds: expiresMinutes * 60,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async verifyForgotPasswordOtp(payload) {
    const phoneNumber = this.normalizePhoneNumber(payload.phoneNumber);
    const { otp } = payload;

    const otpRecord = await PasswordResetOtp.findOne({
      where: {
        phoneNumber,
        purpose: "FORGOT_PASSWORD",
        usedAt: null,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      throw new AppError("OTP not found", 404);
    }

    if (otpRecord.usedAt) {
      throw new AppError("OTP has already been used", 400);
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      throw new AppError("OTP has expired", 400);
    }

    const maxAttempts = Number(
      process.env.FORGOT_PASSWORD_OTP_MAX_ATTEMPTS || 5,
    );

    if (otpRecord.attemptCount >= maxAttempts) {
      throw new AppError("OTP attempt limit exceeded", 429);
    }

    const isValidOtp = await comparePassword(otp, otpRecord.otpHash);

    await otpRecord.update({
      attemptCount: otpRecord.attemptCount + 1,
      verifiedAt: isValidOtp ? new Date() : otpRecord.verifiedAt,
    });

    if (!isValidOtp) {
      throw new AppError("Invalid OTP", 400);
    }

    return {
      verified: true,
      phoneNumber: this.maskPhoneNumber(phoneNumber),
    };
  }

  static async resetForgotPassword(payload) {
    const phoneNumber = this.normalizePhoneNumber(payload.phoneNumber);
    const { otp, newPassword, confirmPassword } = payload;

    if (newPassword !== confirmPassword) {
      throw new AppError("Confirm password does not match", 422);
    }

    const user = await User.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const otpRecord = await PasswordResetOtp.findOne({
      where: {
        phoneNumber,
        purpose: "FORGOT_PASSWORD",
        usedAt: null,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      throw new AppError("OTP not found", 404);
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      throw new AppError("OTP has expired", 400);
    }

    if (otpRecord.attemptCount >= 5) {
      throw new AppError("OTP attempt limit exceeded", 429);
    }

    const isValidOtp = await comparePassword(otp, otpRecord.otpHash);

    await otpRecord.update({
      attemptCount: otpRecord.attemptCount + 1,
    });

    if (!isValidOtp) {
      throw new AppError("Invalid OTP", 400);
    }

    const passwordHash = await hashPassword(newPassword);

    const transaction = await sequelize.transaction();

    try {
      await user.update(
        {
          passwordHash,
        },
        { transaction },
      );

      await otpRecord.update(
        {
          verifiedAt: otpRecord.verifiedAt || new Date(),
          usedAt: new Date(),
        },
        { transaction },
      );

      await RefreshToken.update(
        {
          revokedAt: new Date(),
        },
        {
          where: {
            ownerType: "USER",
            ownerId: user.id,
            revokedAt: null,
          },
          transaction,
        },
      );

      await transaction.commit();

      return {
        reset: true,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = AuthService;
