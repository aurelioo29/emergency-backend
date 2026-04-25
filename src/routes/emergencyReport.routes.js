const express = require("express");
const router = express.Router();

const EmergencyReportController = require("../controllers/emergencyReport.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createEmergencyReportValidation,
  emergencyReportIdParamValidation,
  myReportsQueryValidation,
  allReportsQueryValidation,
  updateEmergencyReportStatusValidation,
  cancelEmergencyReportValidation,
} = require("../validations/emergencyReport.validation");
const { uploadEmergencyPhoto } = require("../middlewares/upload.middleware");

router.use(authMiddleware);

// user
router.post(
  "/",
  uploadEmergencyPhoto.single("photo"),
  createEmergencyReportValidation,
  validate,
  EmergencyReportController.create,
);

router.patch(
  "/:id/cancel",
  cancelEmergencyReportValidation,
  validate,
  EmergencyReportController.cancelReport,
);

router.get(
  "/me",
  myReportsQueryValidation,
  validate,
  EmergencyReportController.getMyReports,
);

// admin
router.get(
  "/",
  allReportsQueryValidation,
  validate,
  EmergencyReportController.getAll,
);

router.patch(
  "/:id/status",
  updateEmergencyReportStatusValidation,
  validate,
  EmergencyReportController.updateStatus,
);

// shared
router.get(
  "/:id",
  emergencyReportIdParamValidation,
  validate,
  EmergencyReportController.getDetail,
);

module.exports = router;
