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
    socket.on('joinRoom', ({ fromUser, toUser }) => {
      const roomId = [fromUser, toUser].sort().join("_");
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    }); 
    
    socket.on('sendMessage', (messagePayload) => {
      // messagePayload = { from, to, text, ... }
      const roomId = [messagePayload.from, messagePayload.to].sort().join("_");
      
      // Send the message to everyone in the room except the original sender
      socket.to(roomId).emit('receiveMessage', messagePayload);
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
};

module.exports = { initializeSocket };
