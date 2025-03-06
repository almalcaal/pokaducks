import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";

import User from "../models/user.model.js";

// @desc      Register a new user
// @route     POST /api/auth/signup
// @access    Public
export const signupUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email and password are required inputs" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (user) {
      generateToken(res, user._id);

      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    }
  } catch (err) {
    console.log("ERROR in signupUser controller", err.message);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc      Authenticate user / get token
// @route     POST /api/auth/login
// @access    Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    const correctPassword = await user.matchPassword(password);

    if (!user && !correctPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.log("Error in loginUser controller", err.message);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc      Logout user / clear cookie
// @route     POST /api/auth/logout
// @access    Private
export const logoutUser = (req, res) => {
  try {
    res.cookie("my_jwt_token", "", {
      maxAge: 0,
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log("Error in logoutUser controller", err.message);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc            Update current user profile
// @route           PUT /api/auth/update-profile
// @access          Private
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    const userId = req.user._id;

    if (!profilePic) {
      res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    console.log("Error in updateProfile controller", err.message);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc      Check user authentication on data update/refresh
// @route     GET /api/auth/check
// @access    Private
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    console.log("Error in checkAuth controller", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
