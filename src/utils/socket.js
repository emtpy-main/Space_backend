const { Server } = require("socket.io");
// FIX: Correctly require the default export from ES Modules
const Conversation = require('../models/conversation').default;
const Message = require('../models/Message').default;

const initializeSocket = (server) => {
  const io = new Server(server, {
    // Your existing CORS and path configuration
    path: "/my-custom-path/",
    cors: {
      origin: "http://localhost:5173",
    },
  });

  const emailToSocketIdMap = new Map();
  const socketIdToEmailMap = new Map();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // --- Join Room and Fetch History ---
    socket.on('joinRoom', async ({ fromUser, toUser }) => {
      try {
        // 1. Create a consistent Room ID
        const roomId = [fromUser, toUser].sort().join("_");
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);

        let conversation = await Conversation.findOne({
          participants: { $all: [fromUser, toUser] },
        });

        if (!conversation) {
          conversation = new Conversation({
            participants: [fromUser, toUser],
          });
          await conversation.save();
          console.log(`Created new conversation for room: ${roomId}`);
        }

        // 3. Fetch chat history for this conversation
        const chatHistory = await Message.find({
          conversationId: conversation._id,
        }).sort({ createdAt: 'asc' }); // Sort by oldest first
        console.log(`Fetched ${chatHistory.length} messages for room: ${roomId}`);
        // 4. Emit the chat history only to the user who just joined
        socket.emit('chatHistory', chatHistory);

      } catch (error) {
        console.error("Error in joinRoom event:", error);
        // Optionally emit an error back to the client
        socket.emit('error', 'Could not join room or fetch history.');
      }
    });

    // --- Send and Save Message ---
    socket.on('sendMessage', async (messagePayload) => {
      try {
        const { from, to, content } = messagePayload;
        const roomId = [from, to].sort().join("_");
        console.log(`Received message from ${from} to ${to}: ${content}`);
        const conversation = await Conversation.findOne({
          participants: { $all: [from, to] },
        });
        if (!conversation) {
          return console.error("Cannot send message: conversation not found.");
        }
        const newMessage = new Message({
          conversationId: conversation._id,
          senderId: from,
          content: content,
        });
        const savedMessage = await newMessage.save();
        conversation.lastMessage = savedMessage._id;
        await conversation.save();
        io.to(roomId).emit('receiveMessage', savedMessage);
      } catch (error) {
        console.error("Error in sendMessage event:", error);
      }
    });

    //------------------------- video call signaling -------------------------//
    socket.on('join-room', (data) => {
      const { roomId, emailId } = data;
      console.log('User with email:', emailId, 'joined room:', roomId);
      socketIdToEmailMap.set(socket.id, emailId);
      emailToSocketIdMap.set(emailId, socket.id);
      socket.join(roomId);
      socket.emit('joined-room', { roomId });
      socket.broadcast.to(roomId).emit('user-joined', { emailId });
    });

    socket.on('call-user', (data) => {
      const { emailId, offer } = data;
      const fromEmailId = socketIdToEmailMap.get(socket.id);
      const targetSocketId = emailToSocketIdMap.get(emailId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-call', { from: fromEmailId, offer });
      }
    });

    socket.on('call-accepted', (data) => {
      const { emailId, ans } = data;
      const targetSocketId = emailToSocketIdMap.get(emailId);
      socket.to(targetSocketId).emit('call-accepted', { ans });
    });
    socket.on('call-ended', (data) => {
      const { emailId } = data || {};
      const fromUserId = socketIdToEmailMap.get(socket.id);
      const targetSocketId = emailToSocketIdMap.get(emailId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended', { from: fromUserId });
      }
    });
    socket.on("disconnect", () => {
      const email = socketIdToEmailMap.get(socket.id);
      if (email) {
        emailToSocketIdMap.delete(email);
        socketIdToEmailMap.delete(socket.id);
        io.emit("user-left", { email });
      }
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
};

module.exports = { initializeSocket };

