const mongoose = require("mongoose");

const connectdb= async ()=>{
    await mongoose.connect(
    "mongodb+srv://pratiksingh:qnTRJg42en7PKgmi@cluster0.v95t9mt.mongodb.net/devTinder"
);
};

module.exports = connectdb ;
