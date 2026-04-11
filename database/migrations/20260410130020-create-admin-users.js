"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_users", {
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
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("SUPERADMIN", "DISPATCHER", "ADMIN"),
        allowNull: false,
        defaultValue: "DISPATCHER",
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

    await queryInterface.addIndex("admin_users", ["email"], {
      name: "admin_users_email_idx",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("admin_users");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_admin_users_role";',
    );
  },
};
