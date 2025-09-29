const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const decoded = jwt.verify(token, "Dev@Tinder$790");
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { userAuth };