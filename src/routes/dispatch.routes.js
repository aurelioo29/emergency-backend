const express = require("express");
const router = express.Router();

const DispatchController = require("../controllers/dispatch.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createDispatchValidation,
  allDispatchesQueryValidation,
  dispatchIdParamValidation,
  dispatchReportIdParamValidation,
  updateDispatchStatusValidation,
  completeDispatchValidation,
  rejectDispatchValidation,
} = require("../validations/dispatch.validation");

router.use(authMiddleware);

// admin
router.post("/", createDispatchValidation, validate, DispatchController.create);

router.get(
  "/",
  allDispatchesQueryValidation,
  validate,
  DispatchController.getAll,
);

router.patch(
  "/:id/status",
  updateDispatchStatusValidation,
  validate,
  DispatchController.updateStatus,
);

router.patch(
  "/:id/reject",
  rejectDispatchValidation,
  validate,
  DispatchController.reject,
);

// shared
router.get(
  "/report/:reportId",
  dispatchReportIdParamValidation,
  validate,
  DispatchController.getByReport,
);

// officer actions
router.patch(
  "/:id/accept",
  dispatchIdParamValidation,
  validate,
  DispatchController.accept,
);

router.patch(
  "/:id/start",
  dispatchIdParamValidation,
  validate,
  DispatchController.start,
);

router.patch(
  "/:id/arrive",
  dispatchIdParamValidation,
  validate,
  DispatchController.arrive,
);

router.patch(
  "/:id/complete",
  completeDispatchValidation,
  validate,
  DispatchController.complete,
);

module.exports = router;
