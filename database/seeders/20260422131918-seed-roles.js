"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("roles", [
      {
        id: randomUUID(),
        role_code: "AMBULANCE_DRIVER",
        role_name: "Ambulance Driver",
        description: "Officer responsible for driving ambulance units",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        role_code: "PARAMEDIC",
        role_name: "Paramedic",
        description: "Medical emergency responder",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        role_code: "FIRE_OFFICER",
        role_name: "Fire Officer",
        description: "Fire and rescue field officer",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        role_code: "POLICE",
        role_name: "Police",
        description: "Police emergency responder",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", {
      role_code: ["AMBULANCE_DRIVER", "PARAMEDIC", "FIRE_OFFICER", "POLICE"],
    });
  },
};
