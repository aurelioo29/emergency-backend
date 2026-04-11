"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("dispatches", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "emergency_reports",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      officer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "officers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      ambulance_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "ambulances",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      assigned_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "admin_users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      accepted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      finished_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dispatch_status: {
        type: Sequelize.ENUM(
          "ASSIGNED",
          "ACCEPTED",
          "ON_THE_WAY",
          "ARRIVED",
          "COMPLETED",
          "CANCELLED",
        ),
        allowNull: false,
        defaultValue: "ASSIGNED",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("dispatches", ["report_id"], {
      name: "dispatches_report_id_idx",
    });

    await queryInterface.addIndex("dispatches", ["officer_id"], {
      name: "dispatches_officer_id_idx",
    });

    await queryInterface.addIndex("dispatches", ["ambulance_id"], {
      name: "dispatches_ambulance_id_idx",
    });

    await queryInterface.addIndex("dispatches", ["assigned_by"], {
      name: "dispatches_assigned_by_idx",
    });

    await queryInterface.addIndex("dispatches", ["dispatch_status"], {
      name: "dispatches_dispatch_status_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("dispatches");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_dispatches_dispatch_status";',
    );
  },
};
