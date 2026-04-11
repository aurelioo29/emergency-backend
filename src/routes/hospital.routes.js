const express = require("express");
const router = express.Router();

const HospitalController = require("../controllers/hospital.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createHospitalValidation,
  updateHospitalValidation,
  hospitalIdParamValidation,
  hospitalListQueryValidation,
} = require("../validations/hospital.validation");

router.use(authMiddleware, adminMiddleware);

router.post("/", createHospitalValidation, validate, HospitalController.create);
router.get(
  "/",
  hospitalListQueryValidation,
  validate,
  HospitalController.getAll,
);
router.get(
  "/:id",
  hospitalIdParamValidation,
  validate,
  HospitalController.getById,
);
router.patch(
  "/:id",
  updateHospitalValidation,
  validate,
  HospitalController.update,
);
router.delete(
  "/:id",
  hospitalIdParamValidation,
  validate,
  HospitalController.delete,
);

module.exports = router;
