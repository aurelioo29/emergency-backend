"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
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
      nik: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addIndex("users", ["nik"], {
      name: "users_nik_idx",
      unique: true,
    });

    await queryInterface.addIndex("users", ["phone_number"], {
      name: "users_phone_number_idx",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
