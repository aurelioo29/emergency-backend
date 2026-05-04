const express = require("express");
const router = express.Router();

const OfficerController = require("../controllers/officer.controller");
const DispatchController = require("../controllers/dispatch.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validation.middleware");

const {
  createOfficerValidation,
  updateOfficerValidation,
  officerIdParamValidation,
  officerListQueryValidation,
  updateMyOfficerStatusValidation,
} = require("../validations/officer.validation");

const {
  emergencyReportIdParamValidation,
} = require("../validations/emergencyReport.validation");

router.use(authMiddleware);

/**
 * Officer self routes
 */
router.patch(
  "/me/status",
  updateMyOfficerStatusValidation,
  validate,
  OfficerController.updateMyStatus,
);

router.get("/me/reports/available", DispatchController.getAvailableReports);

router.patch(
  "/me/reports/:reportId/accept",
  emergencyReportIdParamValidation,
  validate,
  DispatchController.acceptAvailableReport,
);

/**
 * Admin officer management routes
 */
router.use(adminMiddleware);

router.post("/", createOfficerValidation, validate, OfficerController.create);

router.get("/", officerListQueryValidation, validate, OfficerController.getAll);

router.get(
  "/:id",
  officerIdParamValidation,
  validate,
  OfficerController.getById,
);

router.patch(
  "/:id",
  updateOfficerValidation,
  validate,
  OfficerController.update,
);

router.patch(
  "/:id/deactivate",
  officerIdParamValidation,
  validate,
  OfficerController.deactivate,
);

module.exports = router;
