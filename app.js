const express = require("express");
const path = require("path");
const userRouter = require("./api/routes/user");
const session = require("express-session");

const app = express();

//อ่านไฟล์ static ใน public
app.use(express.static(path.join(__dirname, "public")));

//Cookie
app.use(
    session({
        secret: "gameshop-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    })
);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());    //อ่าน body แบบ JSON

//User router
app.use("/", userRouter);

// --------------------------------------------
app.get("/hello", (req, res) => {
  res.send("URL Test Hello GameShop");
});

module.exports = app;
