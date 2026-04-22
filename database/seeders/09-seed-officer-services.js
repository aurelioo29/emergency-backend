"use strict";

const crypto = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [officers] = await queryInterface.sequelize.query(`
      SELECT id, email
      FROM officers
      WHERE email IN (
        'budi.ambulance1@example.com',
        'rina.paramedic1@example.com',
        'doni.fire1@example.com',
        'maya.police1@example.com'
      )
    `);

    const [services] = await queryInterface.sequelize.query(`
      SELECT id, service_code
      FROM services
      WHERE service_code IN ('AMBULANCE', 'FIRE', 'POLICE')
    `);

    const officerMap = {};
    for (const officer of officers) {
      officerMap[officer.email] = officer.id;
    }

    const serviceMap = {};
    for (const service of services) {
      serviceMap[service.service_code] = service.id;
    }

    if (
      !officerMap["budi.ambulance1@example.com"] ||
      !officerMap["rina.paramedic1@example.com"] ||
      !officerMap["doni.fire1@example.com"] ||
      !officerMap["maya.police1@example.com"]
    ) {
      throw new Error(
        "Required officers not found. Please run officers seeder first.",
      );
    }

    if (!serviceMap.AMBULANCE || !serviceMap.FIRE || !serviceMap.POLICE) {
      throw new Error(
        "Required services not found. Please run services seeder first.",
      );
    }

    await queryInterface.bulkInsert("officer_services", [
      {
        id: crypto.randomUUID(),
        officer_id: officerMap["budi.ambulance1@example.com"],
        service_id: serviceMap.AMBULANCE,
        is_primary: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        officer_id: officerMap["rina.paramedic1@example.com"],
        service_id: serviceMap.AMBULANCE,
        is_primary: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        officer_id: officerMap["doni.fire1@example.com"],
        service_id: serviceMap.FIRE,
        is_primary: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        officer_id: officerMap["maya.police1@example.com"],
        service_id: serviceMap.POLICE,
        is_primary: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        officer_id: officerMap["rina.paramedic1@example.com"],
        service_id: serviceMap.POLICE,
        is_primary: false,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("officer_services", null, {});
  },
};
