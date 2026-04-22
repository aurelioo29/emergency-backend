"use strict";

module.exports = {
  async up(queryInterface) {
    const [services] = await queryInterface.sequelize.query(`
      SELECT id, service_code FROM services
    `);

    const serviceMap = {};
    for (const service of services) {
      serviceMap[service.service_code] = service.id;
    }

    if (serviceMap.AMBULANCE) {
      await queryInterface.sequelize.query(`
        UPDATE emergency_reports
        SET service_id = '${serviceMap.AMBULANCE}'
        WHERE emergency_type = 'AMBULANCE'
      `);
    }

    if (serviceMap.FIRE) {
      await queryInterface.sequelize.query(`
        UPDATE emergency_reports
        SET service_id = '${serviceMap.FIRE}'
        WHERE emergency_type = 'FIRE'
      `);
    }

    if (serviceMap.POLICE) {
      await queryInterface.sequelize.query(`
        UPDATE emergency_reports
        SET service_id = '${serviceMap.POLICE}'
        WHERE emergency_type = 'CRIME'
      `);
    }
  },

  async down() {
    // no-op
  },
};
