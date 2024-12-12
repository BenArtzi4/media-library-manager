import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("User already exists.");
  }

  const newUser = new User({
    username,
    email,
    password,
  });

  try {
    await newUser.save();
    res.redirect("/users/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving user.");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("User not found.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).send("Invalid password.");
  }

  req.session.user = user;
  res.redirect("/"); // Redirect to home after successful login
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/users/login");
});

export default router;
