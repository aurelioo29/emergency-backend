"use strict";

const crypto = require("crypto");

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("hospitals", [
      {
        id: crypto.randomUUID(),
        hospital_name: "RSUP H. Adam Malik",
        address:
          "Jl. Bunga Lau No.17, Kemenangan Tani, Medan Tuntungan, Kota Medan, Sumatera Utara",
        phone_number: "0618360381",
        latitude: 3.595195,
        longitude: 98.635915,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        hospital_name: "RSUD Dr. Pirngadi Medan",
        address:
          "Jl. Prof. H. M. Yamin SH No.47, Perintis, Medan Timur, Kota Medan, Sumatera Utara",
        phone_number: "0614158700",
        latitude: 3.59502,
        longitude: 98.685547,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        hospital_name: "Royal Prima Hospital",
        address:
          "Jl. Ayahanda No.68A, Sei Putih Tengah, Medan Petisah, Kota Medan, Sumatera Utara",
        phone_number: "06188813111",
        latitude: 3.593412,
        longitude: 98.662221,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        hospital_name: "Siloam Hospitals Medan",
        address:
          "Jl. Imam Bonjol No.6, J A T I, Medan Maimun, Kota Medan, Sumatera Utara",
        phone_number: "06180501100",
        latitude: 3.581805,
        longitude: 98.673977,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        hospital_name: "Rumah Sakit Columbia Asia Medan",
        address:
          "Jl. Listrik No.2A, Petisah Tengah, Medan Petisah, Kota Medan, Sumatera Utara",
        phone_number: "0614568368",
        latitude: 3.586984,
        longitude: 98.675479,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("hospitals", {
      hospital_name: [
        "RSUP H. Adam Malik",
        "RSUD Dr. Pirngadi Medan",
        "Royal Prima Hospital",
        "Siloam Hospitals Medan",
        "Rumah Sakit Columbia Asia Medan",
      ],
    });
  },
};
