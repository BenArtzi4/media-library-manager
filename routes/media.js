import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Media page is under construction!");
});

export default router;
