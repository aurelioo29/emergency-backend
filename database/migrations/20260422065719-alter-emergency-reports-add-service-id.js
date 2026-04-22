"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("emergency_reports", "service_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "services",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("emergency_reports", "accepted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("emergency_reports", "cancelled_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("emergency_reports", "failed_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex("emergency_reports", ["service_id"], {
      name: "emergency_reports_service_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "emergency_reports",
      "emergency_reports_service_id_idx",
    );
    await queryInterface.removeColumn("emergency_reports", "failed_at");
    await queryInterface.removeColumn("emergency_reports", "cancelled_at");
    await queryInterface.removeColumn("emergency_reports", "accepted_at");
    await queryInterface.removeColumn("emergency_reports", "service_id");
  },
};
