"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE dispatches d
      SET service_id = er.service_id
      FROM emergency_reports er
      WHERE d.report_id = er.id
        AND d.service_id IS NULL
    `);
  },

  async down() {
    // no-op
  },
};
