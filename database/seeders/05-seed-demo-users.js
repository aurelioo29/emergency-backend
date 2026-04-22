"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("User12345!", 10);

    await queryInterface.bulkInsert("users", [
      {
        id: crypto.randomUUID(),
        full_name: "Aurel Demo",
        nik: "1271010101010001",
        phone_number: "081300000001",
        address: "Jl. Gatot Subroto, Medan",
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        full_name: "Nadia Demo",
        nik: "1271010101010002",
        phone_number: "081300000002",
        address: "Jl. Setia Budi, Medan",
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      phone_number: ["081300000001", "081300000002"],
    });
  },
};
