import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import userRoutes from "./routes/userRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

import { RedisStore } from "connect-redis";
import { createClient } from "redis";

const app = express();
const PORT = process.env.PORT;

const mongoURI = process.env.MONGODB_URI;

async function connectToMongo() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
}

connectToMongo();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create and connect Redis client
const redisClient = createClient({
  url: "redis://redis:6379",
});
await redisClient.connect();

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
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

app.get("/media/:genre", async (req, res) => {
  const genre = req.params.genre;
  await serveRandomSong(req, res, genre);
});

async function serveRandomSong(req, res, genre) {
  try {
    let songs = await redisClient.get(`songs:${genre}`);
    if (!songs) {
      // Not cached, read from filesystem
      const mediaDir = path.join(__dirname, "media", genre);
      let files;
      try {
        files = fs.readdirSync(mediaDir);
      } catch (err) {
        return res.status(500).send("Error reading the media directory");
      }

      const mp3Files = files.filter((file) => file.endsWith(".mp3"));

      if (mp3Files.length === 0) {
        return res.status(404).send("No songs found in this genre");
      }

      // Cache the mp3 files list in Redis - Cache for 1 hour
      await redisClient.setEx(`songs:${genre}`, 3600, JSON.stringify(mp3Files));
      songs = mp3Files;
    } else {
      songs = JSON.parse(songs);
    }

    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    const [artist, song] = randomSong.replace(".mp3", "").split(" - ");
    const imageName = randomSong.replace(".mp3", ".png");
    const songPath = `/media/${genre}/${randomSong}`;

    res.render("genre", {
      genre: genre.replace("-", " ").toUpperCase(),
      song,
      artist,
      image: `/media/${genre}/${imageName}`,
      songPath,
    });
  } catch (error) {
    console.error("Error serving random song:", error);
    res.status(500).send("Internal Server Error");
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
