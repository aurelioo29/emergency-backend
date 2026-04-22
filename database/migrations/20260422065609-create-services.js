"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("services", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      service_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      service_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      icon_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      color_hex: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      requires_dispatch: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      auto_accept_mode: {
        type: Sequelize.ENUM("FULL_AUTO", "CONFIRM", "MANUAL"),
        allowNull: false,
        defaultValue: "CONFIRM",
      },
      accept_timeout_seconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("services", ["service_code"], {
      unique: true,
      name: "services_service_code_idx",
    });

    await queryInterface.addIndex("services", ["is_active"], {
      name: "services_is_active_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("services");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_services_auto_accept_mode";',
    );
  },
};
