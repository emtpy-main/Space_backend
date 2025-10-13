import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    // An array of user IDs who are part of this conversation.
    // This allows for both one-on-one and group chats.
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model
        required: true,
      },
    ],

    // A reference to the last message sent in this conversation.
    // This is a great optimization for displaying chat list previews.
    // Instead of querying the whole messages collection, you can just populate this.
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message', // References the 'Message' model
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
