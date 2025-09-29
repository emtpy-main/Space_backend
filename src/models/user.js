const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email address " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (value && !["male", "female", "other"].includes(value.toLowerCase())) {
          throw new Error("Gender is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/001/840/612/non_2x/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL " + value);
        }
      },
    },
    about: {
      type: String,
      default: "this is default about user",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

// Generate JWT
userSchema.methods.getJWT = async function () {
  const user = this;
  const jwttoken = await jwt.sign({ _id: user._id }, "Dev@Tinder$790", {
    expiresIn: "7d",
  });
  return jwttoken;
};

// Validate Password
userSchema.methods.validatePassword = async function (passwordByUser) {
  const passwordHash = this.password;
  const isPasswordValid = await bcrypt.compare(passwordByUser, passwordHash);
  return isPasswordValid;
};

// create model from schema
const User = mongoose.model("User", userSchema);

module.exports = User;