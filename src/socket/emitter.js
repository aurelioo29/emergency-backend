const { getIO } = require("./index");

const emitToAdminRoom = (event, payload) => {
  const io = getIO();
  io.to("admin-room").emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
  const io = getIO();
  io.to(`user:${userId}`).emit(event, payload);
};

const emitToOfficer = (officerId, event, payload) => {
  const io = getIO();
  io.to(`officer:${officerId}`).emit(event, payload);
};

const emitToReportRoom = (reportId, event, payload) => {
  const io = getIO();
  io.to(`report:${reportId}`).emit(event, payload);
};

module.exports = {
  emitToAdminRoom,
  emitToUser,
  emitToOfficer,
  emitToReportRoom,
};
