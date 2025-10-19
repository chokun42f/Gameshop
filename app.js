const express = require("express");
const path = require("path");
const session = require("express-session");

const userRouter = require("./api/routes/user");
const gameRouter = require("./api/routes/game");
const cartRouter = require("./api/routes/cart");
const walletRouter = require("./api/routes/wallet");

const app = express();

// ✅ ตั้งค่า session ก่อนทุกอย่าง
app.use(
  session({
    secret: "gameshop-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // false เพราะยังไม่ใช่ https
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// ✅ รองรับ JSON และฟอร์ม
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ Routes
app.use("/", userRouter);
app.use("/api/games", gameRouter);
app.use("/api/cart", cartRouter);
app.use("/api/user/wallet", walletRouter);

const transactionsRouter = require("./api/routes/transactions");
app.use("/api/transactions", transactionsRouter);


// ✅ Test route
app.get("/hello", (req, res) => {
  res.send("URL Test Hello GameShop");
});

module.exports = app;
