"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("officers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      full_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
      },
      role: {
        type: Sequelize.ENUM(
          "AMBULANCE_DRIVER",
          "PARAMEDIC",
          "FIRE_OFFICER",
          "POLICE",
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("AVAILABLE", "ON_DUTY", "OFFLINE"),
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

    await queryInterface.addIndex("officers", ["phone_number"], {
      name: "officers_phone_number_idx",
      unique: true,
    });

    await queryInterface.addIndex("officers", ["email"], {
      name: "officers_email_idx",
      unique: true,
    });

    await queryInterface.addIndex("officers", ["role"], {
      name: "officers_role_idx",
    });

    await queryInterface.addIndex("officers", ["status"], {
      name: "officers_status_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("officers");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_officers_role";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_officers_status";',
    );
  },
};
