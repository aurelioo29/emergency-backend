"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("dispatches", "service_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "services",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("dispatches", "assignment_order", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.addColumn("dispatches", "auto_assigned", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn("dispatches", "expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("dispatches", "rejected_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("dispatches", "arrived_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("dispatches", "cancelled_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex("dispatches", ["service_id"], {
      name: "dispatches_service_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("dispatches", "dispatches_service_id_idx");
    await queryInterface.removeColumn("dispatches", "cancelled_at");
    await queryInterface.removeColumn("dispatches", "arrived_at");
    await queryInterface.removeColumn("dispatches", "rejected_at");
    await queryInterface.removeColumn("dispatches", "expires_at");
    await queryInterface.removeColumn("dispatches", "auto_assigned");
    await queryInterface.removeColumn("dispatches", "assignment_order");
    await queryInterface.removeColumn("dispatches", "service_id");
  },
};
