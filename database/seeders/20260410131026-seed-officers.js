"use strict";

const crypto = require("crypto");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Officer12345!", 10);

    await queryInterface.bulkInsert("officers", [
      {
        id: crypto.randomUUID(),
        full_name: "Budi Santoso",
        phone_number: "081200000101",
        email: "budi.ambulance1@example.com",
        password_hash: passwordHash,
        role: "AMBULANCE_DRIVER",
        status: "AVAILABLE",
        is_active: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        full_name: "Rina Pratiwi",
        phone_number: "081200000102",
        email: "rina.paramedic1@example.com",
        password_hash: passwordHash,
        role: "PARAMEDIC",
        status: "AVAILABLE",
        is_active: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        full_name: "Doni Saputra",
        phone_number: "081200000103",
        email: "doni.fire1@example.com",
        password_hash: passwordHash,
        role: "FIRE_OFFICER",
        status: "AVAILABLE",
        is_active: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        full_name: "Maya Lestari",
        phone_number: "081200000104",
        email: "maya.police1@example.com",
        password_hash: passwordHash,
        role: "POLICE",
        status: "AVAILABLE",
        is_active: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
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
