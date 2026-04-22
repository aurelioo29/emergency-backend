"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      role_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      role_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex("roles", ["role_code"], {
      name: "roles_role_code_idx",
      unique: true,
    });

    await queryInterface.addIndex("roles", ["is_active"], {
      name: "roles_is_active_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("roles");
  },
};
