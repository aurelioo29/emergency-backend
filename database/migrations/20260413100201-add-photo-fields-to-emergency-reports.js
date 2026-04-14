"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("emergency_reports", "photo_url", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("emergency_reports", "photo_captured_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("emergency_reports", "photo_url");
    await queryInterface.removeColumn("emergency_reports", "photo_captured_at");
  },
};
