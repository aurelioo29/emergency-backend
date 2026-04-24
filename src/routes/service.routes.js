const express = require("express");
const router = express.Router();

const ServiceController = require("../controllers/service.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { uploadServiceIcon } = require("../middlewares/upload.middleware");
const {
  createServiceValidation,
  updateServiceValidation,
  serviceIdParamValidation,
  allServicesQueryValidation,
  toggleServiceActiveValidation,
} = require("../validations/service.validation");

// public / shared
router.get("/active", ServiceController.getActive);

// protected
router.use(authMiddleware);

router.get("/", allServicesQueryValidation, validate, ServiceController.getAll);

router.get(
  "/:id",
  serviceIdParamValidation,
  validate,
  ServiceController.getDetail,
);

router.post(
  "/",
  uploadServiceIcon.single("icon"),
  createServiceValidation,
  validate,
  ServiceController.create,
);

router.patch(
  "/:id",
  uploadServiceIcon.single("icon"),
  updateServiceValidation,
  validate,
  ServiceController.update,
);

router.patch(
  "/:id/toggle-active",
  toggleServiceActiveValidation,
  validate,
  ServiceController.toggleActive,
);

module.exports = router;
