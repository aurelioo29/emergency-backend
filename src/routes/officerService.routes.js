const express = require("express");
const router = express.Router();

const OfficerServiceController = require("../controllers/officerService.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createOfficerServiceValidation,
  updateOfficerServiceValidation,
  officerServiceIdParamValidation,
  officerIdParamValidation,
  allOfficerServicesQueryValidation,
} = require("../validations/officerService.validation");

router.use(authMiddleware);

router.get(
  "/",
  allOfficerServicesQueryValidation,
  validate,
  OfficerServiceController.getAll,
);

router.get(
  "/officer/:officerId",
  officerIdParamValidation,
  validate,
  OfficerServiceController.getByOfficer,
);

router.post(
  "/",
  createOfficerServiceValidation,
  validate,
  OfficerServiceController.create,
);

router.patch(
  "/:id",
  updateOfficerServiceValidation,
  validate,
  OfficerServiceController.update,
);

router.delete(
  "/:id",
  officerServiceIdParamValidation,
  validate,
  OfficerServiceController.remove,
);

module.exports = router;
