const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const emergencyReportRoutes = require("./emergencyReport.routes");
const dispatchRoutes = require("./dispatch.routes");
const officerLocationRoutes = require("./officerLocation.routes");
const hospitalRoutes = require("./hospital.routes");
const officerRoutes = require("./officer.routes");
const ambulanceRoutes = require("./ambulance.routes");
const userProfileRoutes = require("./userProfile.routes");
const serviceRoutes = require("./service.routes");
const officerServiceRoutes = require("./officerService.routes");

// route modules
router.use("/auth", authRoutes);
router.use("/emergency-reports", emergencyReportRoutes);
router.use("/dispatches", dispatchRoutes);
router.use("/officer-locations", officerLocationRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/officers", officerRoutes);
router.use("/ambulances", ambulanceRoutes);
router.use("/users", userProfileRoutes);
router.use("/services", serviceRoutes);
router.use("/officer-services", officerServiceRoutes);

module.exports = router;
