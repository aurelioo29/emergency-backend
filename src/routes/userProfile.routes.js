const express = require("express");
const router = express.Router();

const UserProfileController = require("../controllers/userProfile.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  updateMyProfileValidation,
  changePasswordValidation,
  createEmergencyContactValidation,
  updateEmergencyContactValidation,
  emergencyContactIdParamValidation,
  createDiseaseHistoryValidation,
  updateDiseaseHistoryValidation,
  diseaseHistoryIdParamValidation,
} = require("../validations/userProfile.validation");

router.use(authMiddleware);

// profile
router.get("/me", UserProfileController.getMyProfile);
router.patch(
  "/me",
  updateMyProfileValidation,
  validate,
  UserProfileController.updateMyProfile,
);
router.patch(
  "/me/change-password",
  changePasswordValidation,
  validate,
  UserProfileController.changePassword,
);

// emergency contacts
router.get(
  "/me/emergency-contacts",
  UserProfileController.getEmergencyContacts,
);
router.post(
  "/me/emergency-contacts",
  createEmergencyContactValidation,
  validate,
  UserProfileController.createEmergencyContact,
);
router.patch(
  "/me/emergency-contacts/:id",
  updateEmergencyContactValidation,
  validate,
  UserProfileController.updateEmergencyContact,
);
router.delete(
  "/me/emergency-contacts/:id",
  emergencyContactIdParamValidation,
  validate,
  UserProfileController.deleteEmergencyContact,
);

// disease histories
router.get("/me/disease-histories", UserProfileController.getDiseaseHistories);
router.post(
  "/me/disease-histories",
  createDiseaseHistoryValidation,
  validate,
  UserProfileController.createDiseaseHistory,
);
router.patch(
  "/me/disease-histories/:id",
  updateDiseaseHistoryValidation,
  validate,
  UserProfileController.updateDiseaseHistory,
);
router.delete(
  "/me/disease-histories/:id",
  diseaseHistoryIdParamValidation,
  validate,
  UserProfileController.deleteDiseaseHistory,
);

module.exports = router;
