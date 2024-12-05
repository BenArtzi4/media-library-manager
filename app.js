// Import dependencies
import express from "express";
import mediaRoutes from "./routes/media.js"; // Media routes

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public")); // Serve static files from 'public'
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Home route
app.get("/", (req, res) => {
  res.render("welcome"); // Render the EJS welcome page
});

// Media routes
app.use("/media", mediaRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
