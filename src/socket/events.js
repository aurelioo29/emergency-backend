const { verifyAccessToken } = require("../utils/jwt");

const registerSocketEvents = (io) => {
  io.use((socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }

      const decoded = verifyAccessToken(token);
      socket.user = decoded;

      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `🔌 Connected: ${socket.id} | ${socket.user.type}:${socket.user.id}`,
    );

    // join rooms
    if (socket.user.type === "ADMIN") {
      socket.join("admin-room");
    }

    if (socket.user.type === "USER") {
      socket.join(`user:${socket.user.id}`);
    }

    if (socket.user.type === "OFFICER") {
      socket.join("officer-room");
      socket.join(`officer:${socket.user.id}`);
    }

    // report room
    socket.on("join:report", (reportId) => {
      socket.join(`report:${reportId}`);
    });

    socket.on("leave:report", (reportId) => {
      socket.leave(`report:${reportId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
};

module.exports = { registerSocketEvents };
