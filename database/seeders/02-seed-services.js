"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("services", [
      {
        id: randomUUID(),
        service_code: "AMBULANCE",
        service_name: "Ambulance",
        description: "Emergency medical transport service",
        icon_name: "ambulance",
        color_hex: "#EF4444",
        requires_dispatch: true,
        auto_accept_mode: "CONFIRM",
        accept_timeout_seconds: 15,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        service_code: "FIRE",
        service_name: "Fire Rescue",
        description: "Fire and rescue emergency response",
        icon_name: "flame",
        color_hex: "#F97316",
        requires_dispatch: true,
        auto_accept_mode: "CONFIRM",
        accept_timeout_seconds: 15,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        service_code: "POLICE",
        service_name: "Police",
        description: "Police emergency response",
        icon_name: "shield",
        color_hex: "#3B82F6",
        requires_dispatch: true,
        auto_accept_mode: "CONFIRM",
        accept_timeout_seconds: 15,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        service_code: "HOSPITAL_REFERRAL",
        service_name: "Hospital Referral",
        description: "Nearest hospital recommendation service",
        icon_name: "hospital",
        color_hex: "#10B981",
        requires_dispatch: false,
        auto_accept_mode: "MANUAL",
        accept_timeout_seconds: 0,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("services", {
      service_code: ["AMBULANCE", "FIRE", "POLICE", "HOSPITAL_REFERRAL"],
    });
  },
};
