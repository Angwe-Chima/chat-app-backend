import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import catchHandler from "../utils/handleCatchError.js";

export const signup = async (req, res) => {
  try {
    console.log("Signup request body:", req.body);

    const { fullName, userName, password, confirmPassword, gender } = req.body;

    // Validation
    if (!fullName || !userName || !password || !confirmPassword || !gender) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    const user = await User.findOne({ userName });
    if (user) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    // Hash password here
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`;

    const newUser = new User({
      fullName,
      userName,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
    });

    if (newUser) {
      await newUser.save();
      generateTokenAndSetCookie(newUser._id, res);

      const userData = {
        _id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        profilePic: newUser.profilePic,
      };

      res.status(201).json(userData);
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    console.error("Signup error:", err);
    catchHandler(err, "signup", res);
  }
};

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const foundUser = await User.findOne({ userName });
    if (!foundUser) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    generateTokenAndSetCookie(foundUser._id, res);

    const userData = {
      _id: foundUser._id,
      fullName: foundUser.fullName,
      userName: foundUser.userName,
      profilePic: foundUser.profilePic,
    };

    console.log("User logged in successfully:", userData);
    res.status(200).json(userData);
  } catch (err) {
    console.error("Login error:", err);
    catchHandler(err, "login", res);
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    catchHandler(err, "logout", res);
  }
};
