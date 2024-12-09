import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // Assuming your User model is in 'models/User.js'

const router = express.Router();

// Route to display registration page
router.get("/register", (req, res) => {
  res.render("register"); // Render the register view (you should create this file)
});

// Route to handle user registration
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Simple validation
  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("User already exists.");
  }

  // Create a new user
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save(); // Save the user to the database
    res.redirect("/login"); // Redirect to login page after successful registration
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving user.");
  }
});

// Route to display login page
router.get("/login", (req, res) => {
  res.render("login"); // Render the login view (you should create this file)
});

// Route to handle user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("User not found.");
  }

  const isMatch = await bcrypt.compare(password, user.password); // Compare password with hashed password
  if (!isMatch) {
    return res.status(400).send("Invalid password.");
  }

  // Store the user in the session
  req.session.user = user;

  res.redirect("/"); // Redirect to home or a logged-in page
});

// Route to handle user logout
router.get("/logout", (req, res) => {
  req.session.destroy(); // Destroy the session
  res.redirect("/login"); // Redirect to login page after logging out
});

export default router;
