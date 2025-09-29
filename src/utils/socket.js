// utils/socket.js
const { Server } = require("socket.io");

const initializeSocket = (server) => {
  const io = new Server(server, {
    path: "/my-custom-path/",
    cors: {
      origin: "http://localhost:5173",
    }
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};

module.exports = { initializeSocket };
