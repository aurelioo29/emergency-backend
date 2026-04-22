"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_emergency_reports_status"
      ADD VALUE IF NOT EXISTS 'ACCEPTED'
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_emergency_reports_status"
      ADD VALUE IF NOT EXISTS 'FAILED'
    `);
  },

  async down() {
    // no-op
  },
};
