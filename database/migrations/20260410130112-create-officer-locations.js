"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("officer_locations", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      officer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "officers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      report_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "emergency_reports",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false,
      },
      recorded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("officer_locations", ["officer_id"], {
      name: "officer_locations_officer_id_idx",
    });

    await queryInterface.addIndex("officer_locations", ["report_id"], {
      name: "officer_locations_report_id_idx",
    });

    await queryInterface.addIndex("officer_locations", ["recorded_at"], {
      name: "officer_locations_recorded_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("officer_locations");
  },
};
