const express = require("express");
const router = express.Router();

const AmbulanceController = require("../controllers/ambulance.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createAmbulanceValidation,
  updateAmbulanceValidation,
  ambulanceIdParamValidation,
  ambulanceListQueryValidation,
} = require("../validations/ambulance.validation");

router.use(authMiddleware, adminMiddleware);

router.post(
  "/",
  createAmbulanceValidation,
  validate,
  AmbulanceController.create,
);
router.get(
  "/",
  ambulanceListQueryValidation,
  validate,
  AmbulanceController.getAll,
);
router.get(
  "/:id",
  ambulanceIdParamValidation,
  validate,
  AmbulanceController.getById,
);
router.patch(
  "/:id",
  updateAmbulanceValidation,
  validate,
  AmbulanceController.update,
);
router.delete(
  "/:id",
  ambulanceIdParamValidation,
  validate,
  AmbulanceController.delete,
);

module.exports = router;
