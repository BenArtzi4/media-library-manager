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
// Serve static files from the 'media' directory (for images and songs)
app.use("/media", express.static(path.join(__dirname, "media")));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Specify the views directory

// Root route (Welcome Page)
app.get("/", (req, res) => {
  res.render("welcome"); // Render the welcome.ejs page
});

// Genre-specific routes using a dynamic route handler
app.get("/media/:genre", (req, res) => {
  const genre = req.params.genre;
  serveRandomSong(res, genre);
});

// Function to serve a random song and its image
function serveRandomSong(res, genre) {
  const mediaDir = path.join(__dirname, "media", genre);

  fs.readdir(mediaDir, (err, files) => {
    if (err) {
      res.status(500).send("Error reading the media directory");
      return;
    }

    const songs = files.filter((file) => file.endsWith(".mp3"));

    if (songs.length === 0) {
      res.status(404).send("No songs found in this genre");
      return;
    }

    const randomSong = songs[Math.floor(Math.random() * songs.length)];

    const [artist, song] = randomSong.replace(".mp3", "").split(" - ");

    const imageName = randomSong.replace(".mp3", ".png");

    const songPath = `/media/${genre}/${randomSong}`;

    res.render("genre", {
      genre: genre.replace("-", " ").toUpperCase(),
      song: song, // Song name (e.g., "Kol Dvar Kat")
      artist: artist, // Artist name (e.g., "Alon Olarcik")
      image: `/media/${genre}/${imageName}`,
      songPath: songPath, // Full path for the song
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
