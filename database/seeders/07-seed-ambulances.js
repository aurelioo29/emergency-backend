"use strict";

const crypto = require("crypto");

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("ambulances", [
      {
        id: crypto.randomUUID(),
        code: "AMB-001",
        plate_number: "BK 1234 MED",
        current_latitude: 3.595195,
        current_longitude: 98.635915,
        status: "AVAILABLE",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: "AMB-002",
        plate_number: "BK 2234 MED",
        current_latitude: 3.593412,
        current_longitude: 98.662221,
        status: "DISPATCHED",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: "AMB-003",
        plate_number: "BK 3234 MED",
        current_latitude: 3.581805,
        current_longitude: 98.673977,
        status: "MAINTENANCE",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: "AMB-004",
        plate_number: "BK 4234 MED",
        current_latitude: 3.586984,
        current_longitude: 98.675479,
        status: "AVAILABLE",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("ambulances", {
      code: ["AMB-001", "AMB-002", "AMB-003", "AMB-004"],
    });
  },
};
