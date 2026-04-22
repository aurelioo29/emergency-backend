const express = require("express");
const router = express.Router();

const RoleController = require("../controllers/role.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createRoleValidation,
  updateRoleValidation,
  roleIdParamValidation,
  allRolesQueryValidation,
  toggleRoleActiveValidation,
} = require("../validations/role.validation");

// public/shared
router.get("/active", RoleController.getActive);

// protected
router.use(authMiddleware);

router.get("/", allRolesQueryValidation, validate, RoleController.getAll);

router.get("/:id", roleIdParamValidation, validate, RoleController.getDetail);

router.post("/", createRoleValidation, validate, RoleController.create);

router.patch("/:id", updateRoleValidation, validate, RoleController.update);

router.patch(
  "/:id/toggle-active",
  toggleRoleActiveValidation,
  validate,
  RoleController.toggleActive,
);

module.exports = router;
