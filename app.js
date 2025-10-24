const express = require("express");
const path = require("path");
const session = require("express-session");
require('dotenv').config();

const userRouter = require("./api/routes/user");
const gameRouter = require("./api/routes/game");
const cartRouter = require("./api/routes/cart");
const walletRouter = require("./api/routes/wallet");
const libraryRouter = require("./api/routes/library");
const transactionsRouter = require("./api/routes/transactions");
const codeRouter = require("./api/routes/code");

const app = express();

// ------------------- SESSION -------------------
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7*24*60*60*1000 }
}));


// ------------------- JSON / FORM -------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ------------------- Static files -------------------
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/image_game", express.static(path.join(__dirname, "public/image_game")));

// ------------------- Routes -------------------
app.use("/", userRouter);
app.use("/api/games", gameRouter);
app.use("/api/cart", cartRouter);
app.use("/api/user/wallet", walletRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api", libraryRouter);
app.use("/api/codes", codeRouter);

// ------------------- Test -------------------
app.get("/hello", (req, res) => res.send("Hello GameShop"));

module.exports = app;
