const express = require("express");
const path = require("path");
const session = require("express-session");

const RedisStore = require('connect-redis')(session);
const redisClient = require('./redis-client');

const userRouter = require("./api/routes/user");
const gameRouter = require("./api/routes/game");
const cartRouter = require("./api/routes/cart");
const walletRouter = require("./api/routes/wallet");
const libraryRouter = require("./api/routes/library");
const transactionsRouter = require("./api/routes/transactions");

const app = express();

// ✅ Session
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'gameshop-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7*24*60*60*1000 }
}));


// ✅ JSON และ form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ Serve image_game folder
app.use('/image_game', express.static(path.join(__dirname, 'public/image_game')));

// ✅ Routes
app.use("/", userRouter);
app.use("/api/games", gameRouter);
app.use("/api/cart", cartRouter);
app.use("/api/user/wallet", walletRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api", libraryRouter);

const codeRouter = require("./api/routes/code");
app.use("/api/codes", codeRouter);

// ✅ Test
app.get("/hello", (req, res) => res.send("Hello GameShop"));

module.exports = app;
