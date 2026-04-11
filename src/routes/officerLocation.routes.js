const express = require("express");
const router = express.Router();

const OfficerLocationController = require("../controllers/officerLocation.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  updateOfficerLocationValidation,
  reportIdParamValidation,
} = require("../validations/officerLocation.validation");

router.use(authMiddleware);

router.post(
  "/",
  updateOfficerLocationValidation,
  validate,
  OfficerLocationController.update,
);

router.get(
  "/latest/:reportId",
  reportIdParamValidation,
  validate,
  OfficerLocationController.getLatest,
);

router.get(
  "/history/:reportId",
  reportIdParamValidation,
  validate,
  OfficerLocationController.getHistory,
);

module.exports = router;
