const express = require("express");
const connectdb = require("./config/database");
const cookieParser = require("cookie-parser");
const http = require('http');
const cors = require("cors"); // ✅ FIX: Import the cors package

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const { init } = require("./models/user");
const { initializeSocket } = require("./utils/socket");
const app = express();

// This will now work correctly for your API routes
app.use(cors({
  origin : "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials : true,
}));

app.use(cookieParser());
app.use(express.json());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/",userRouter);

const server = http.createServer(app);
initializeSocket(server); 
connectdb()
  .then(() => {
    console.log("Database connection established");
    server.listen(7777, () => {
      console.log("Server is running at http://localhost:7777/");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });