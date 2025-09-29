const express = require("express");
const { validateSignUpData, validateEmailId } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

// SIGNUP ROUTE
authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;

    // Validate user input
    validateSignUpData({ firstName, lastName, emailId, password });

    // Check if user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
      // Generate JWT
    const token = await user.getJWT();

    // Set cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
    });

    await user.save();
    res.status(201).json({ message: "User added successfully" ,user});
  } catch (err) {
    console.error("Error while saving user =>", err.message);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN ROUTE
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Validate email
    validateEmailId(emailId);

    // Find user
    const user = await User.findOne({ emailId });

    // Validate credentials
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = await user.getJWT();

    // Set cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
    });

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
      },
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

// LOGOUT ROUTE
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ message: "Logout successfully" });
});

module.exports = authRouter;


