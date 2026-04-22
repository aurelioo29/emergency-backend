"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("officer_services", {
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
      service_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "services",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex("officer_services", ["officer_id"], {
      name: "officer_services_officer_id_idx",
    });

    await queryInterface.addIndex("officer_services", ["service_id"], {
      name: "officer_services_service_id_idx",
    });

    await queryInterface.addConstraint("officer_services", {
      fields: ["officer_id", "service_id"],
      type: "unique",
      name: "officer_services_unique_officer_service",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("officer_services");
  },
};
