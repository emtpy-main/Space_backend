import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // The ID of the conversation this message is a part of.
    // This is the crucial link that groups messages into a single chat.
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation', // References the 'Conversation' model
      required: true,
    },

    // The ID of the user who sent the message.
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the 'User' model
      required: true,
    },

    // The actual text content of the message.
    content: {
      type: String,
      required: true,
      trim: true, // Removes whitespace from both ends of the string
    },
    
    // You could add more fields here, for example:
    // status: {
    //   type: String,
    //   enum: ['sent', 'delivered', 'read'],
    //   default: 'sent'
    // }
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

// Create an index on conversationId and createdAt for fast querying.
// This is essential for fetching messages for a specific chat, sorted by time.
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
