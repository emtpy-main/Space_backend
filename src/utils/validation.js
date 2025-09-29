const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");

const authRouter = express.Router();

const validateSignUpData = ({ firstName, lastName, emailId, password }) => {
  if (!firstName || !lastName || !emailId || !password) {
    throw new Error("All fields (first name, last name, email, password) are required.");
  }

  if (firstName.length < 4 || firstName.length > 50) {
    throw new Error("First name must be between 4 and 50 characters.");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Please enter a valid email address.");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol."
    );
  }
};

const validateEmailId = (emailId) => {
  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid Email");
  }
  return true;
};

const validateEditProfileData = (body) => {
  const allowedEditField = ["firstName", "lastName", "gender", "skills", "about", "photoUrl", "age"];
  const keys = Object.keys(body);

  // Check for invalid fields
  if (!keys.every(field => allowedEditField.includes(field))) {
    throw new Error("Invalid field in edit request.");
  }

  // Validate each field according to your user model
  if (body.firstName && (body.firstName.length < 4 || body.firstName.length > 50)) {
    throw new Error("First name must be between 4 and 50 characters.");
  }
  if (body.age && (typeof body.age !== "number" || body.age < 18)) {
    throw new Error("Age must be a number and at least 18.");
  }
  if (body.gender && !["male", "female", "other"].includes(body.gender.toLowerCase())) {
    throw new Error("Gender is not valid.");
  }
  if (body.photoUrl && !validator.isURL(body.photoUrl)) {
    throw new Error("Invalid Photo URL.");
  }
  if (body.skills && (!Array.isArray(body.skills) || body.skills.length > 10)) {
    throw new Error("Skills must be an array with at most 10 items.");
  }
  // about: no strict validation, but you can add if needed

  return true;
};
 

module.exports = { validateEmailId, validateSignUpData, validateEditProfileData };
