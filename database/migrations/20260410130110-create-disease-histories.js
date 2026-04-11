"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("disease_histories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
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
      disease_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("disease_histories", ["user_id"], {
      name: "disease_histories_user_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("disease_histories");
  },
};
