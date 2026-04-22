"use strict";

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(`
      SELECT id, role_code FROM roles
    `);

    const roleMap = {};
    for (const role of roles) {
      roleMap[role.role_code] = role.id;
    }

    if (roleMap.AMBULANCE_DRIVER) {
      await queryInterface.sequelize.query(`
        UPDATE officers
        SET role_id = '${roleMap.AMBULANCE_DRIVER}'
        WHERE role = 'AMBULANCE_DRIVER'
      `);
    }

    if (roleMap.PARAMEDIC) {
      await queryInterface.sequelize.query(`
        UPDATE officers
        SET role_id = '${roleMap.PARAMEDIC}'
        WHERE role = 'PARAMEDIC'
      `);
    }

    if (roleMap.FIRE_OFFICER) {
      await queryInterface.sequelize.query(`
        UPDATE officers
        SET role_id = '${roleMap.FIRE_OFFICER}'
        WHERE role = 'FIRE_OFFICER'
      `);
    }

    if (roleMap.POLICE) {
      await queryInterface.sequelize.query(`
        UPDATE officers
        SET role_id = '${roleMap.POLICE}'
        WHERE role = 'POLICE'
      `);
    }
  },

  async down() {
    // no-op
  },
};
