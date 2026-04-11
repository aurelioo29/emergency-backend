"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("report_tracking_logs", {
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
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      updated_by_type: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      updated_by_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("report_tracking_logs", ["report_id"], {
      name: "report_tracking_logs_report_id_idx",
    });

    await queryInterface.addIndex("report_tracking_logs", ["status"], {
      name: "report_tracking_logs_status_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("report_tracking_logs");
  },
};
