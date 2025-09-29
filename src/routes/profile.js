const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const { User } = require("../models/user");
// GET USER PROFILE
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Please Login"
      });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateEditProfileData(req.body); // Validate and throw if invalid

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });
    await loggedInUser.save();
    res.status(200).json({
      message: `${loggedInUser.firstName}, your profile updated successfully.`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const newpassword = req.body.newpassword;

    const newpasswordHash = await bcrypt.hash(newpassword, 10);

    // Get user from DB using ID in token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.password = newpasswordHash;

    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password." });
  }
});

module.exports = profileRouter;