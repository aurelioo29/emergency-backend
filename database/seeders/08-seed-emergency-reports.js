"use strict";

const crypto = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [users] = await queryInterface.sequelize.query(`
      SELECT id, phone_number
      FROM users
      WHERE phone_number IN ('081300000001', '081300000002')
    `);

    const [services] = await queryInterface.sequelize.query(`
      SELECT id, service_code
      FROM services
      WHERE service_code IN ('AMBULANCE', 'FIRE', 'POLICE')
    `);

    const [hospitals] = await queryInterface.sequelize.query(`
      SELECT id, hospital_name
      FROM hospitals
      ORDER BY created_at ASC
      LIMIT 1
    `);

    const userMap = {};
    for (const user of users) {
      userMap[user.phone_number] = user.id;
    }

    const serviceMap = {};
    for (const service of services) {
      serviceMap[service.service_code] = service.id;
    }

    const nearestHospitalId = hospitals[0]?.id || null;

    if (!userMap["081300000001"] || !userMap["081300000002"]) {
      throw new Error(
        "Required users not found. Please run demo users seeder first.",
      );
    }

    if (!serviceMap.AMBULANCE || !serviceMap.FIRE || !serviceMap.POLICE) {
      throw new Error(
        "Required services not found. Please run services seeder first.",
      );
    }

    if (!nearestHospitalId) {
      throw new Error(
        "Required hospital not found. Please run hospitals seeder first.",
      );
    }

    await queryInterface.bulkInsert("emergency_reports", [
      {
        id: crypto.randomUUID(),
        report_code: "EMG-SEED-001",
        user_id: userMap["081300000001"],
        nearest_hospital_id: nearestHospitalId,
        emergency_type: "AMBULANCE",
        description: "Seed emergency report for ambulance case",
        latitude: -6.2,
        longitude: 106.8166667,
        address_snapshot: "Jl. Sudirman, Jakarta",
        photo_url: null,
        photo_captured_at: null,
        status: "ASSIGNED",
        requested_at: now,
        assigned_at: now,
        arrived_at: null,
        completed_at: null,
        service_id: serviceMap.AMBULANCE,
        accepted_at: now,
        cancelled_at: null,
        failed_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        report_code: "EMG-SEED-002",
        user_id: userMap["081300000001"],
        nearest_hospital_id: nearestHospitalId,
        emergency_type: "FIRE",
        description: "Seed emergency report for fire case",
        latitude: -6.21,
        longitude: 106.82,
        address_snapshot: "Jl. Thamrin, Jakarta",
        photo_url: null,
        photo_captured_at: null,
        status: "ASSIGNED",
        requested_at: now,
        assigned_at: now,
        arrived_at: null,
        completed_at: null,
        service_id: serviceMap.FIRE,
        accepted_at: null,
        cancelled_at: null,
        failed_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        report_code: "EMG-SEED-003",
        user_id: userMap["081300000002"],
        nearest_hospital_id: nearestHospitalId,
        emergency_type: "AMBULANCE",
        description: "Seed emergency report already on the way",
        latitude: -6.22,
        longitude: 106.83,
        address_snapshot: "Jl. Gatot Subroto, Jakarta",
        photo_url: null,
        photo_captured_at: null,
        status: "ON_THE_WAY",
        requested_at: now,
        assigned_at: now,
        arrived_at: null,
        completed_at: null,
        service_id: serviceMap.AMBULANCE,
        accepted_at: now,
        cancelled_at: null,
        failed_at: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("emergency_reports", {
      report_code: ["EMG-SEED-001", "EMG-SEED-002", "EMG-SEED-003"],
    });
  },
};
