"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("refresh_tokens", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      owner_type: {
        type: Sequelize.ENUM("USER", "ADMIN", "OFFICER"),
        allowNull: false,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex(
      "refresh_tokens",
      ["owner_type", "owner_id"],
      {
        name: "refresh_tokens_owner_type_owner_id_idx",
      },
    );

    await queryInterface.addIndex("refresh_tokens", ["expires_at"], {
      name: "refresh_tokens_expires_at_idx",
    });

    await queryInterface.addIndex("refresh_tokens", ["revoked_at"], {
      name: "refresh_tokens_revoked_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("refresh_tokens");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_refresh_tokens_owner_type";',
    );
  },
};
