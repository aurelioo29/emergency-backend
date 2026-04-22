"use strict";

const crypto = require("crypto");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Officer12345!", 10);
    const now = new Date();

    const [roles] = await queryInterface.sequelize.query(`
      SELECT id, role_code
      FROM roles
      WHERE role_code IN ('AMBULANCE_DRIVER', 'PARAMEDIC', 'FIRE_OFFICER', 'POLICE')
    `);

    const roleMap = {};
    for (const role of roles) {
      roleMap[role.role_code] = role.id;
    }

    if (
      !roleMap.AMBULANCE_DRIVER ||
      !roleMap.PARAMEDIC ||
      !roleMap.FIRE_OFFICER ||
      !roleMap.POLICE
    ) {
      throw new Error(
        "Required roles not found. Please run roles seeder before officers seeder.",
      );
    }

    await queryInterface.bulkInsert("officers", [
      {
        id: crypto.randomUUID(),
        full_name: "Budi Santoso",
        phone_number: "081200000101",
        email: "budi.ambulance1@example.com",
        password_hash: passwordHash,
        role: "AMBULANCE_DRIVER", // legacy fallback sementara
        role_id: roleMap.AMBULANCE_DRIVER,
        status: "AVAILABLE",
        is_active: true,
        last_login_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        full_name: "Rina Pratiwi",
        phone_number: "081200000102",
        email: "rina.paramedic1@example.com",
        password_hash: passwordHash,
        role: "PARAMEDIC", // legacy fallback sementara
        role_id: roleMap.PARAMEDIC,
        status: "AVAILABLE",
        is_active: true,
        last_login_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        full_name: "Doni Saputra",
        phone_number: "081200000103",
        email: "doni.fire1@example.com",
        password_hash: passwordHash,
        role: "FIRE_OFFICER", // legacy fallback sementara
        role_id: roleMap.FIRE_OFFICER,
        status: "AVAILABLE",
        is_active: true,
        last_login_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        full_name: "Maya Lestari",
        phone_number: "081200000104",
        email: "maya.police1@example.com",
        password_hash: passwordHash,
        role: "POLICE", // legacy fallback sementara
        role_id: roleMap.POLICE,
        status: "AVAILABLE",
        is_active: true,
        last_login_at: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("officers", {
      email: [
        "budi.ambulance1@example.com",
        "rina.paramedic1@example.com",
        "doni.fire1@example.com",
        "maya.police1@example.com",
      ],
    });
  },
};
