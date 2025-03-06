import { generateToken } from "../lib/utils.js";

import User from "../models/user.model.js";

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
    console.log(`ERROR in signup controller`, err.message);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = (req, res) => {
  res.send("login route");
};

export const logoutUser = (req, res) => {
  res.send("logout route");
};
