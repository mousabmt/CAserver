// socket.js
const { Server } = require('socket.io');
let io;                      // private reference

function init(server) {
  io = new Server(server, { cors: { origin: '*', methods: ['GET','POST'] } });
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}

module.exports = { init, getIO };
