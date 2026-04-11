"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ambulances", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      plate_number: {
        type: Sequelize.STRING(30),
        allowNull: true,
        unique: true,
      },
      current_latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      current_longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("AVAILABLE", "DISPATCHED", "MAINTENANCE"),
        allowNull: false,
        defaultValue: "AVAILABLE",
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

    await queryInterface.addIndex("ambulances", ["code"], {
      name: "ambulances_code_idx",
      unique: true,
    });

    await queryInterface.addIndex("ambulances", ["plate_number"], {
      name: "ambulances_plate_number_idx",
      unique: true,
    });

    await queryInterface.addIndex("ambulances", ["status"], {
      name: "ambulances_status_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ambulances");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_ambulances_status";',
    );
  },
};
