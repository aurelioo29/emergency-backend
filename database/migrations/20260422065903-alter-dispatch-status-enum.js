"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_dispatches_dispatch_status"
      ADD VALUE IF NOT EXISTS 'REJECTED'
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_dispatches_dispatch_status"
      ADD VALUE IF NOT EXISTS 'EXPIRED'
    `);
  },

  async down() {
    // PostgreSQL enum rollback is annoying.
    // Usually left as no-op unless rebuilding enum type manually.
  },
};
