const { User, AdminUser, Officer, RefreshToken } = require("../models");
const { hashPassword, comparePassword } = require("../utils/hash");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const AppError = require("../utils/AppError");

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

  static async saveRefreshToken({ ownerType, ownerId, token }) {
    return RefreshToken.create({
      ownerType,
      ownerId,
      token,
      expiresAt: this.getRefreshTokenExpiryDate(),
    });
  }

  static async register(payload) {
    const { fullName, nik, phoneNumber, address, password } = payload;

    const existingPhone = await User.findOne({
      where: { phoneNumber },
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
      phoneNumber,
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

    const user = await User.findOne({
      where: { phoneNumber },
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

    await storedToken.update({
      revokedAt: new Date(),
    });

    const newPayload = {
      id: decoded.id,
      role: decoded.role,
      type: decoded.type,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    await this.saveRefreshToken({
      ownerType: decoded.type,
      ownerId: decoded.id,
      token: newRefreshToken,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(authUser, payload) {
    const { refreshToken } = payload;

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
}

module.exports = AuthService;
