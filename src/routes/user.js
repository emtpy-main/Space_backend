const { userAuth } = require("../middlewares/auth");
const express = require("express");
const userRouter = express.Router();

const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const USER_SAFE_DATA = "firstName lastName photoUrl age skills about gender"
// Get all received connection requests with status "interested"
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId",USER_SAFE_DATA); // populate data from other collection 
   // }).populate("fromUserId",["firstName","lastName"]); // populate data from other collection 

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});


userRouter.get("/user/connections",userAuth,async (req,res)=> {
    try{
        const loggedInUser = req.user;

        const connections = await ConnectionRequest.find({
            $or:[
                { toUserId : loggedInUser , status : "accepted" },
                { fromUserId : loggedInUser , status : "accepted" }
            ]
        }).populate("fromUserId", USER_SAFE_DATA)
          .populate("toUserId",USER_SAFE_DATA)

        const data = connections.map((row) =>{
          if(row.toUserId._id.toString() === loggedInUser._id.toString()){
            return row.fromUserId;
          }
          else{
            return row.toUserId;
          }
        });
        res.json({ message: "connection fetched", data });
    } 
    catch(err){
        res.status(400).send("Error " + err.message);
    }
})


userRouter.get("/feed",userAuth,async (req,res) => {
  try{
    const loggedInUser=req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit>50 ? 50 :limit;
    const skip = (page-1)*limit;



    // find all connection (sent + received)
    const connections = await ConnectionRequest.find({
      $or : [{toUserId : loggedInUser._id},{fromUserId : loggedInUser._id}]
    }).select("fromUserId toUserId");

    const hideUserFromFeed = new Set();
    connections.forEach((eachconnection) => {
      hideUserFromFeed.add(eachconnection.fromUserId.toString());
      hideUserFromFeed.add(eachconnection.toUserId.toString());
    });

    // set can't pass to json() bcz it is non serializable
    // console.log(hideUserFromFeed);

    const users = await User.find({
      $and : [
        { _id : { $nin : Array.from(hideUserFromFeed)}},
        { _id : { $ne : loggedInUser._id}}]
    }).select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({users});
  }
  catch(err){
    res.status(400).send("Error " + err.message);
  }
});

module.exports = userRouter;