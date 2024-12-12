import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import userRoutes from "./routes/userRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT;

const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use the secret from the .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Middleware to check if user is logged in
app.use((req, res, next) => {
  res.locals.user = req.session.user; // Make user available in all views
  next();
});

// Routes
app.use("/users", userRoutes);

// Resolve __dirname equivalent in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));
app.use("/media", express.static(path.join(__dirname, "media")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  }

  const genres = [
    {
      name: "English Classics",
      slug: "english-classics",
      image: "/images/english-classics.jpg",
    },
    {
      name: "English Party",
      slug: "english-party",
      image: "/images/english-party.jpg",
    },
    {
      name: "Israeli Classics",
      slug: "israeli-classics",
      image: "/images/israeli-classics.jpg",
    },
    {
      name: "Israeli Party",
      slug: "israeli-party",
      image: "/images/israeli-party.jpg",
    },
  ];

  res.render("welcome", { user: req.session.user, genres });
});

app.get("/media/:genre", (req, res) => {
  const genre = req.params.genre;
  serveRandomSong(res, genre);
});

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
      song: song,
      artist: artist,
      image: `/media/${genre}/${imageName}`,
      songPath: songPath,
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
