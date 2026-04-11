const { verifyAccessToken } = require("../utils/jwt");

const registerSocketEvents = (io) => {
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      let pureToken = token;

      if (typeof token === "string" && token.startsWith("Bearer ")) {
        pureToken = token.split(" ")[1];
      }

      const decoded = verifyAccessToken(pureToken);

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `🔌 Socket connected: ${socket.id} | ${socket.user.type}:${socket.user.id}`,
    );

    // auto join personal room
    if (socket.user.type === "ADMIN") {
      socket.join("admin-room");
    }

    if (socket.user.type === "USER") {
      socket.join(`user:${socket.user.id}`);
    }

    if (socket.user.type === "OFFICER") {
      socket.join(`officer:${socket.user.id}`);
    }

    // join room report tertentu
    socket.on("join:report", (reportId) => {
      socket.join(`report:${reportId}`);
      console.log(`Socket ${socket.id} joined report:${reportId}`);
    });

    socket.on("leave:report", (reportId) => {
      socket.leave(`report:${reportId}`);
      console.log(`Socket ${socket.id} left report:${reportId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = {
  registerSocketEvents,
};
