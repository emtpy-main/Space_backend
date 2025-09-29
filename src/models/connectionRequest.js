const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // corrected 'require' to 'required'
      ref: "User", // reference to User collection 
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // corrected 'require' to 'required'
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "rejected", "accepted"],
        message: "{VALUE} is incorrect status type",
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// compound indexing to make query faster 
connectionRequestSchema.index({toUserId : 1,fromUserId : 1});


//schema pre method it excute function before saving data to dB each and every time.
connectionRequestSchema.pre("save",function (next){
  const connectionRequest = this;
  if(connectionRequest.toUserId.equals(connectionRequest.fromUserId))
    throw new Error("Cannot send connection request to yourself");
  next();
})

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema); // Capitalized model name

module.exports = ConnectionRequest;