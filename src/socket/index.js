const { Server } = require("socket.io");
const { registerSocketEvents } = require("./events");

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });

  registerSocketEvents(io);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
