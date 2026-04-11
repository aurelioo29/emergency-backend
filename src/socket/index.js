const { Server } = require("socket.io");
const { registerSocketEvents } = require("./events");

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  registerSocketEvents(io);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }

  return io;
};

module.exports = {
  initSocket,
  getIO,
};
