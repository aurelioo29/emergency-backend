require("dotenv").config();
const http = require("http");
const app = require("./app");
const sequelize = require("./config/database");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    const httpServer = http.createServer(app);

    initSocket(httpServer);

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
