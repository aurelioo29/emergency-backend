"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("officers", "password_hash", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("officers", "is_active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn("officers", "last_login_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("officers", "last_login_at");
    await queryInterface.removeColumn("officers", "is_active");
    await queryInterface.removeColumn("officers", "password_hash");
  },
};
