const axios = require("axios");
const AppError = require("../utils/AppError");

class FonnteService {
  static async sendWhatsapp({ target, message }) {
    const token = process.env.FONNTE_TOKEN;

    if (!token) {
      throw new AppError("FONNTE_TOKEN is not configured", 500);
    }

    try {
      const response = await axios.post(
        "https://api.fonnte.com/send",
        {
          target,
          message,
          countryCode: "62",
        },
        {
          headers: {
            Authorization: token,
          },
          timeout: 15000,
        },
      );

      return response.data;
    } catch (error) {
      const messageFromProvider =
        error.response?.data?.reason ||
        error.response?.data?.message ||
        error.message ||
        "Failed to send WhatsApp message";

      throw new AppError(`Fonnte error: ${messageFromProvider}`, 502);
    }
  }
}

module.exports = FonnteService;
