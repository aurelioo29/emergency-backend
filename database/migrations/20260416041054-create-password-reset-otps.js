"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("password_reset_otps", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
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
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      otp_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      purpose: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "FORGOT_PASSWORD",
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      attempt_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_sent_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("password_reset_otps", ["phone_number"], {
      name: "password_reset_otps_phone_number_idx",
    });

    await queryInterface.addIndex("password_reset_otps", ["user_id"], {
      name: "password_reset_otps_user_id_idx",
    });

    await queryInterface.addIndex(
      "password_reset_otps",
      ["phone_number", "purpose", "used_at"],
      {
        name: "password_reset_otps_lookup_idx",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("password_reset_otps");
  },
};
