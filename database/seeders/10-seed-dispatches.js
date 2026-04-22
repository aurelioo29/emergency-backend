"use strict";

const crypto = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [reports] = await queryInterface.sequelize.query(`
      SELECT id, report_code, service_id
      FROM emergency_reports
      WHERE report_code IN ('EMG-SEED-001', 'EMG-SEED-002', 'EMG-SEED-003')
    `);

    const [officers] = await queryInterface.sequelize.query(`
      SELECT id, email
      FROM officers
      WHERE email IN (
        'budi.ambulance1@example.com',
        'rina.paramedic1@example.com',
        'doni.fire1@example.com'
      )
    `);

    const [ambulances] = await queryInterface.sequelize.query(`
      SELECT id, code
      FROM ambulances
      WHERE code IN ('AMB-001', 'AMB-002')
    `);

    const reportMap = {};
    for (const report of reports) {
      reportMap[report.report_code] = report;
    }

    const officerMap = {};
    for (const officer of officers) {
      officerMap[officer.email] = officer.id;
    }

    const ambulanceMap = {};
    for (const ambulance of ambulances) {
      ambulanceMap[ambulance.code] = ambulance.id;
    }

    if (
      !reportMap["EMG-SEED-001"] ||
      !reportMap["EMG-SEED-002"] ||
      !reportMap["EMG-SEED-003"]
    ) {
      throw new Error(
        "Required emergency reports not found. Please run emergency reports seeder first.",
      );
    }

    if (
      !officerMap["budi.ambulance1@example.com"] ||
      !officerMap["rina.paramedic1@example.com"] ||
      !officerMap["doni.fire1@example.com"]
    ) {
      throw new Error(
        "Required officers not found. Please run officers seeder first.",
      );
    }

    if (!ambulanceMap["AMB-001"] || !ambulanceMap["AMB-002"]) {
      throw new Error(
        "Required ambulances not found. Please run ambulances seeder first.",
      );
    }

    await queryInterface.bulkInsert("dispatches", [
      {
        id: crypto.randomUUID(),
        report_id: reportMap["EMG-SEED-001"].id,
        service_id: reportMap["EMG-SEED-001"].service_id,
        officer_id: officerMap["budi.ambulance1@example.com"],
        ambulance_id: ambulanceMap["AMB-001"],
        assigned_by: null,
        assigned_at: now,
        accepted_at: now,
        started_at: null,
        finished_at: null,
        dispatch_status: "ACCEPTED",
        notes: "Seeded dispatch for ambulance case",
        assignment_order: 1,
        auto_assigned: true,
        expires_at: null,
        rejected_at: null,
        arrived_at: null,
        cancelled_at: null,
      },
      {
        id: crypto.randomUUID(),
        report_id: reportMap["EMG-SEED-002"].id,
        service_id: reportMap["EMG-SEED-002"].service_id,
        officer_id: officerMap["doni.fire1@example.com"],
        ambulance_id: null,
        assigned_by: null,
        assigned_at: now,
        accepted_at: null,
        started_at: null,
        finished_at: null,
        dispatch_status: "ASSIGNED",
        notes: "Seeded dispatch for fire case",
        assignment_order: 1,
        auto_assigned: true,
        expires_at: new Date(now.getTime() + 15000),
        rejected_at: null,
        arrived_at: null,
        cancelled_at: null,
      },
      {
        id: crypto.randomUUID(),
        report_id: reportMap["EMG-SEED-003"].id,
        service_id: reportMap["EMG-SEED-003"].service_id,
        officer_id: officerMap["rina.paramedic1@example.com"],
        ambulance_id: ambulanceMap["AMB-002"],
        assigned_by: null,
        assigned_at: now,
        accepted_at: now,
        started_at: now,
        finished_at: null,
        dispatch_status: "ON_THE_WAY",
        notes: "Seeded dispatch already on the way",
        assignment_order: 1,
        auto_assigned: true,
        expires_at: null,
        rejected_at: null,
        arrived_at: null,
        cancelled_at: null,
      },
    ]);

    await queryInterface.sequelize.query(`
      UPDATE officers
      SET status = 'ON_DUTY'
      WHERE email IN (
        'budi.ambulance1@example.com',
        'doni.fire1@example.com',
        'rina.paramedic1@example.com'
      )
    `);

    await queryInterface.sequelize.query(`
      UPDATE ambulances
      SET status = 'DISPATCHED'
      WHERE code IN ('AMB-001', 'AMB-002')
    `);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("dispatches", {
      notes: [
        "Seeded dispatch for ambulance case",
        "Seeded dispatch for fire case",
        "Seeded dispatch already on the way",
      ],
    });

    await queryInterface.sequelize.query(`
      UPDATE officers
      SET status = 'AVAILABLE'
      WHERE email IN (
        'budi.ambulance1@example.com',
        'doni.fire1@example.com',
        'rina.paramedic1@example.com'
      )
    `);

    await queryInterface.sequelize.query(`
      UPDATE ambulances
      SET status = 'AVAILABLE'
      WHERE code IN ('AMB-001', 'AMB-002')
    `);
  },
};
