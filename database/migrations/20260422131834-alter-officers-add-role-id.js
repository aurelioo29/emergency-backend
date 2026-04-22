"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("officers", "role_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("officers", ["role_id"], {
      name: "officers_role_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("officers", "officers_role_id_idx");
    await queryInterface.removeColumn("officers", "role_id");
  },
};
