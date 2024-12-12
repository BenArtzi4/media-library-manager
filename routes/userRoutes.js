import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /users/register
 * Render the user registration page.
 */
router.get("/register", (req, res) => {
  res.render("register");
});

/**
 * POST /users/register
 * Handle user registration.
 */
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate password match
  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send("User already exists.");
  }

  // Create and save new user
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

/**
 * GET /users/login
 * Render the login page.
 */
router.get("/login", (req, res) => {
  // Initially, no error
  res.render("login", { error: null });
});

/**
 * POST /users/login
 * Handle user login.
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    // User not found, re-render with error
    return res.render("login", { error: "User not found." });
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    // Wrong password, re-render with error
    return res.render("login", { error: "Invalid password." });
  }

  // If match, set user session and redirect
  req.session.user = user;
  res.redirect("/");
});

/**
 * GET /users/logout
 * Log the user out and destroy the session.
 */
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/users/login");
});

/**
 * GET /users/forgot-password
 * Render the forgot password page.
 */
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { error: null, message: null });
});

/**
 * POST /users/forgot-password
 * Handle forgot password - generate a reset token and send an email.
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.render("forgot-password", {
      error: "No user found with that email.",
      message: null,
    });
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send email with reset link
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetURL = `http://localhost:3000/users/reset-password/${resetToken}`;
  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "songElite - Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
    
Please click on the following link, or paste this into your browser to complete the process:
${resetURL}

If you did not request this, please ignore this email and your password will remain unchanged.
`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error("Error sending email:", err);
      return res.render("forgot-password", {
        error: "Error sending email. Please try again.",
        message: null,
      });
    }
    res.render("forgot-password", {
      error: null,
      message: "Password reset email sent successfully.",
    });
  });
});

/**
 * GET /users/reset-password/:token
 * Render the reset password form if token is valid.
 */
router.get("/reset-password/:token", async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .send("Password reset token is invalid or has expired.");
  }

  res.render("reset-password", { token: req.params.token });
});

/**
 * POST /users/reset-password/:token
 * Handle new password submission.
 */
router.post("/reset-password/:token", async (req, res) => {
  const { password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .send("Password reset token is invalid or has expired.");
  }

  // Update the user's password
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.send("Password has been updated successfully.");
});

export default router;
