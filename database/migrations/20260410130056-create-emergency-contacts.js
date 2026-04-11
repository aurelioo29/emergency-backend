"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("emergency_contacts", {
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
      contact_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      relation: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("emergency_contacts", ["user_id"], {
      name: "emergency_contacts_user_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("emergency_contacts");
  },
};
