const validator = require("validator");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/Helpers");

// sign User
const createUser = async (req, res) => {
  try {
    const { username, emailId, password, role } = req.body;
    // checking is all feilds are present
    if (!username || !emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!.",
      });
    }

    if (role && role !== "admin" && role !== "user") {
      return res.status(400).json({
        success: false,
        message: "role is not a correct format.",
      });
    }

    //  Checking Email Id is in correct format
    const isValidEmail = validator.isEmail(emailId);
    if (!isValidEmail) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid EmailId!.",
      });
    }

    // Checking if the user is already Exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please login instead.",
      });
    }

    // checking for strong password
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must include minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      emailId,
      password: hashPassword,
      role: role || "user",
    });
    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;
    console.log(userResponse);
    res.status(201).json({
      success: true,
      data: userResponse,
      message: "New user created successfully!.",
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000 && error.keyPattern?.emailId) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while creating user.",
    });
  }
};

// login user
const loginUser = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!.",
      });
    }

    const findUser = await User.findOne({ emailId });
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await bcrypt.compare(password, findUser.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(findUser);

    const userResponse = findUser.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.status(200).json({
      success: true,
      data: userResponse,
      token,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while creating user.",
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!.",
      });
    }

    const findUser = await User.findOne({ emailId });
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await bcrypt.compare(password, findUser.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (findUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied!, Not an Admin",
      });
    }

    const token = generateToken(findUser);

    const userResponse = findUser.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.status(200).json({
      success: true,
      data: userResponse,
      token,
      message: "Admin Logged in successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while creating user.",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  adminLogin,
};
