import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register route
router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generate a token
    const token = jwt.sign({ userId: newUser._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user: newUser });
  }
);

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Compare the password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Generate a token
  const token = jwt.sign({ userId: user._id }, "your-secret-key", {
    expiresIn: "1h",
  });

  res.json({ token, user });
});

export default router;
