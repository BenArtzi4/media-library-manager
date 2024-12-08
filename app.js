import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve __dirname equivalent in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from the 'public' folder (for images and styles)
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Specify the views directory

// Root route
app.get("/", (req, res) => {
  res.render("welcome"); // Render the welcome.ejs page
});

// Genre-specific routes (example for one genre, more can be added)
app.get("/media/english-classics", (req, res) => {
  serveRandomSong(res, "english-classics");
});

app.get("/media/english-party", (req, res) => {
  serveRandomSong(res, "english-party");
});

app.get("/media/israeli-party", (req, res) => {
  serveRandomSong(res, "israeli-party");
});

app.get("/media/israeli-classics", (req, res) => {
  serveRandomSong(res, "israeli-classics");
});

// Function to serve a random song and its image
function serveRandomSong(res, genre) {
  const mediaDir = path.join(__dirname, "media", genre);

  // Get all files in the genre directory
  fs.readdir(mediaDir, (err, files) => {
    if (err) {
      res.status(500).send("Error reading the media directory");
      return;
    }

    // Filter out only the mp3 files (songs)
    const songs = files.filter((file) => file.endsWith(".mp3"));

    if (songs.length === 0) {
      res.status(404).send("No songs found in this genre");
      return;
    }

    // Pick a random song using Math.random()
    const randomSong = songs[Math.floor(Math.random() * songs.length)];

    // Construct the corresponding image name (same name as the song but with a .png extension)
    const imageName = randomSong.replace(".mp3", ".png");

    // Render the page with the song and the image
    res.render("genre", {
      genre: genre.replace("-", " ").toUpperCase(),
      song: randomSong,
      image: `/images/${genre}/${imageName}`,
    });
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
