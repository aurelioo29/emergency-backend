"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [services] = await queryInterface.sequelize.query(`
      SELECT id, service_code FROM services
    `);

    const [officers] = await queryInterface.sequelize.query(`
      SELECT id, role FROM officers
    `);

    const serviceMap = {};
    for (const service of services) {
      serviceMap[service.service_code] = service.id;
    }

    const rows = [];

    for (const officer of officers) {
      let serviceId = null;

      if (officer.role === "AMBULANCE_DRIVER" || officer.role === "PARAMEDIC") {
        serviceId = serviceMap.AMBULANCE;
      } else if (officer.role === "FIRE_OFFICER") {
        serviceId = serviceMap.FIRE;
      } else if (officer.role === "POLICE") {
        serviceId = serviceMap.POLICE;
      }

      if (serviceId) {
        rows.push({
          id: randomUUID(),
          officer_id: officer.id,
          service_id: serviceId,
          is_primary: true,
          created_at: now,
          updated_at: now,
        });
      }
    }

    if (rows.length > 0) {
      await queryInterface.bulkInsert("officer_services", rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("officer_services", null, {});
  },
};
