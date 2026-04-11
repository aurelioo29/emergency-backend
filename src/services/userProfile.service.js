const { User, EmergencyContact, DiseaseHistory } = require("../models");
const AppError = require("../utils/AppError");
const { comparePassword, hashPassword } = require("../utils/hash");

class UserProfileService {
  static async getMyProfile(authUser) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can access this resource", 403);
    }

    const user = await User.findByPk(authUser.id, {
      attributes: [
        "id",
        "fullName",
        "nik",
        "phoneNumber",
        "address",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  static async updateMyProfile(authUser, payload) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can update profile", 403);
    }

    const user = await User.findByPk(authUser.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (payload.phoneNumber && payload.phoneNumber !== user.phoneNumber) {
      const existingPhone = await User.findOne({
        where: { phoneNumber: payload.phoneNumber },
      });

      if (existingPhone) {
        throw new AppError("Phone number already registered", 409);
      }
    }

    await user.update({
      ...(payload.fullName !== undefined && {
        fullName: payload.fullName,
      }),
      ...(payload.phoneNumber !== undefined && {
        phoneNumber: payload.phoneNumber,
      }),
      ...(payload.address !== undefined && {
        address: payload.address,
      }),
    });

    return {
      id: user.id,
      fullName: user.fullName,
      nik: user.nik,
      phoneNumber: user.phoneNumber,
      address: user.address,
      updatedAt: user.updatedAt,
    };
  }

  static async changePassword(authUser, payload) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can change password", 403);
    }

    const { currentPassword, newPassword } = payload;

    const user = await User.findByPk(authUser.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);

    if (!isValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
      throw new AppError(
        "New password must be different from current password",
        400,
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    await user.update({
      passwordHash: newPasswordHash,
    });

    return {
      passwordChanged: true,
    };
  }

  static async getEmergencyContacts(authUser) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can access emergency contacts", 403);
    }

    return EmergencyContact.findAll({
      where: { userId: authUser.id },
      order: [["createdAt", "DESC"]],
    });
  }

  static async createEmergencyContact(authUser, payload) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can create emergency contact", 403);
    }

    const contact = await EmergencyContact.create({
      userId: authUser.id,
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      relation: payload.relation || null,
    });

    return contact;
  }

  static async updateEmergencyContact(authUser, id, payload) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can update emergency contact", 403);
    }

    const contact = await EmergencyContact.findOne({
      where: {
        id,
        userId: authUser.id,
      },
    });

    if (!contact) {
      throw new AppError("Emergency contact not found", 404);
    }

    await contact.update({
      ...(payload.contactName !== undefined && {
        contactName: payload.contactName,
      }),
      ...(payload.contactPhone !== undefined && {
        contactPhone: payload.contactPhone,
      }),
      ...(payload.relation !== undefined && {
        relation: payload.relation,
      }),
    });

    return contact;
  }

  static async deleteEmergencyContact(authUser, id) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can delete emergency contact", 403);
    }

    const contact = await EmergencyContact.findOne({
      where: {
        id,
        userId: authUser.id,
      },
    });

    if (!contact) {
      throw new AppError("Emergency contact not found", 404);
    }

    await contact.destroy();

    return {
      deleted: true,
    };
  }

  static async getDiseaseHistories(authUser) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can access disease histories", 403);
    }

    return DiseaseHistory.findAll({
      where: { userId: authUser.id },
      order: [["createdAt", "DESC"]],
    });
  }

  static async createDiseaseHistory(authUser, payload) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can create disease history", 403);
    }

    const diseaseHistory = await DiseaseHistory.create({
      userId: authUser.id,
      diseaseName: payload.diseaseName,
      notes: payload.notes || null,
    });

    return diseaseHistory;
  }

  static async updateDiseaseHistory(authUser, id, payload) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can update disease history", 403);
    }

    const diseaseHistory = await DiseaseHistory.findOne({
      where: {
        id,
        userId: authUser.id,
      },
    });

    if (!diseaseHistory) {
      throw new AppError("Disease history not found", 404);
    }

    await diseaseHistory.update({
      ...(payload.diseaseName !== undefined && {
        diseaseName: payload.diseaseName,
      }),
      ...(payload.notes !== undefined && {
        notes: payload.notes,
      }),
    });

    return diseaseHistory;
  }

  static async deleteDiseaseHistory(authUser, id) {
    if (authUser.type !== "USER") {
      throw new AppError("Only user can delete disease history", 403);
    }

    const diseaseHistory = await DiseaseHistory.findOne({
      where: {
        id,
        userId: authUser.id,
      },
    });

    if (!diseaseHistory) {
      throw new AppError("Disease history not found", 404);
    }

    await diseaseHistory.destroy();

    return {
      deleted: true,
    };
  }
}

module.exports = UserProfileService;
