const express = require("express");
const { userAuth } = require("../middlewares/auth");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// Dynamic route: /request/send/:status/:userid
requestRouter.post("/request/send/:status/:userid",
  userAuth, async (req, res) => {
    try {
      
      const fromUserId = req.user._id;
      const toUserId = req.params.userid;
      const status = req.params.status;

      // Validate status
      const allowedStatuses = ["ignored", "interested"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status type"+status });
      }
      // touserId should present in db 
     // toUserId should be present in db 
    const isToUser = await User.findById(toUserId);
    if (!isToUser) {
      return res.status(400).json({
        message: "User not found"
      });
    }

      // we use schema validation pre method to check fromUserId == toUserId 

      // validate connection should be unique
      const existingconnectionReques = await ConnectionRequest.findOne({
        $or :[
          {fromUserId,toUserId},
          {fromUserId : toUserId , toUserId : fromUserId}
        ]
      })

      if(existingconnectionReques){
        return res.status(400).json({
          message : "connection Request already present",
        })
      }
      // Create new instance
      const newRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status
      });

      const data = await newRequest.save();

      res.json({
        message: req.user.firstName + " is " + status + " in " + isToUser.firstName,
        data
      });
    } catch (err) {
      res.status(400).send("Error: " + err.message);
    }
  }
);


requestRouter.post("/request/review/:status/:requestId",userAuth,async (req,res) =>{
      try{

        // to validate
        // requestId in connectionReqest
        //status in allowed stataus acceptec rejected
        // logged in user == toUserId
        // connection should have interested status
        const loggedInUser = req.user;
        const {status,requestId} = req.params;
        
        const allowedstatus=["rejected","accepted"];
        if(!allowedstatus.includes(status)){
          return res.status(400).json({message : "status are not allowed"});
        }

        const connectionReqest= await ConnectionRequest.findOne({
          _id : requestId,
          toUserId : loggedInUser._id,
          status : "interested",
        })

        if(!connectionReqest)
          return res.status(400).json({ message : "connection request not found"});

        connectionReqest.status = status;

        const data = await connectionReqest.save();

        res.json({message : "connection request " + status,data});
      }catch(err){
        res.status(500).send("Error"+err.message);
      }
} )

module.exports = requestRouter;