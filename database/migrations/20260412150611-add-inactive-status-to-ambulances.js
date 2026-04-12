"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ambulances_status"
      ADD VALUE IF NOT EXISTS 'INACTIVE';
    `);
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL tidak mendukung drop enum value secara langsung.
    // Kalau benar-benar mau rollback, harus recreate enum type.
  },
};
