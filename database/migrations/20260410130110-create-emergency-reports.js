"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("emergency_reports", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      report_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nearest_hospital_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "hospitals",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      emergency_type: {
        type: Sequelize.ENUM("SOS", "AMBULANCE", "FIRE", "CRIME"),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      address_snapshot: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "REPORTED",
          "ASSIGNED",
          "ON_THE_WAY",
          "ARRIVED",
          "HANDLING",
          "COMPLETED",
          "CANCELLED",
        ),
        allowNull: false,
        defaultValue: "REPORTED",
      },
      requested_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      arrived_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex("emergency_reports", ["report_code"], {
      name: "emergency_reports_report_code_idx",
      unique: true,
    });

    await queryInterface.addIndex("emergency_reports", ["user_id"], {
      name: "emergency_reports_user_id_idx",
    });

    await queryInterface.addIndex(
      "emergency_reports",
      ["nearest_hospital_id"],
      {
        name: "emergency_reports_nearest_hospital_id_idx",
      },
    );

    await queryInterface.addIndex("emergency_reports", ["status"], {
      name: "emergency_reports_status_idx",
    });

    await queryInterface.addIndex("emergency_reports", ["emergency_type"], {
      name: "emergency_reports_emergency_type_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("emergency_reports");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_emergency_reports_emergency_type";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_emergency_reports_status";',
    );
  },
};
