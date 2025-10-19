const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require("../../dbconn");
const multer = require("multer");

const publicPath = path.join(__dirname, "..", "..", "public");

// ================== Middleware ==================
function isLoggedIn(req, res, next) {
  console.log("Session user:", req.session.user);
  if (req.session.user) next();
  else res.redirect("/");
}
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") next();
  else res.redirect("/user_main"); // ถ้าไม่ใช่ admin → ไปหน้า user_main
}

function isUser(req, res, next) {
  if (req.session.user && req.session.user.role === "user") next();
  else res.redirect("/admin_main"); // ถ้าไม่ใช่ user → ไปหน้า admin_main
}

// ------------------ หน้า HTML ------------------
router.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "login.html"));
});
router.get("/register", (req, res) => {
  res.sendFile(path.join(publicPath, "register.html"));
});

// ใช้ middleware isLoggedIn กับ route ที่ต้อง login
router.get("/user_main", isLoggedIn, isUser, (req, res) => {
  res.sendFile(path.join(publicPath, "user_main.html"));
});
router.get("/admin_main", isLoggedIn, isAdmin, (req, res) => {
  if (req.session.user.role === "admin") {
    res.sendFile(path.join(publicPath, "admin_main.html"));
  } else {
    res.redirect("/user_main");
  }
});
// ------------------ admin ------------------
router.get("/admin_profile", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "admin_profile.html"));
});
router.get("/admin_addgame", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "admin_addgame.html"));
});
router.get("/admin_code", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "admin_code.html"));
});
router.get("/admin_code", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "admin_code.html"));
});
router.get("/admin_viewgame", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "admin_viewgame.html"));
});
router.get("/admin_editgame", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "admin_editgame.html"));
});


// ------------------ user ------------------
router.get("/user_profile", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "user_profile.html"));
});
router.get("/user_edit", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "user_edit.html"));
});
router.get("/user_amount", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "user_amount.html"));
});
router.get("/user_game_detail", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "user_game_detail.html"));
});
router.get("/user_cart", isLoggedIn, (req, res) => {
  res.sendFile(path.join(publicPath, "user_cart.html"));
});


// ------------------ API LOGIN ------------------
  router.post("/login", (req, res) => {
    const { email, password } = req.body;

    pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
          const user = results[0];
          req.session.userId = user.user_id;       // 🔑 สำคัญสำหรับ cart.js
          req.session.userName = user.name;        // optional
          req.session.user = {                     // สำหรับใช้งานหน้า profile, navbar, etc.
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            profile: user.profile,
            wallet_balance: user.wallet_balance

          };

          // ส่งหน้าไปตาม role
          if (user.role === "admin") {
            res.json({ success: true, redirect: "/admin_main" });
          } else {
            res.json({ success: true, redirect: "/user_main" });
          }
        } else {
          res.json({ success: false, message: "Invalid email or password" });
        }
      }
    );
  });


// ------------------ Multer สำหรับ upload profile ------------------
const uploadPath = path.join(publicPath, "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + unique + ext);
  }
});
const upload = multer({ storage: storage });

// ------------------ REGISTER ------------------
router.post("/register", upload.single("profile"), (req, res) => {
  const { name, email, password } = req.body;
  const profileFile = req.file ? "/uploads/" + req.file.filename : null;

  // ตรวจสอบ email ซ้ำ
  pool.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) return res.json({ success: false, message: "Email already exists" });

    // insert user
    pool.query(
      "INSERT INTO users (name, email, password, role, profile) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, "user", profileFile],
      (err2) => {
        if (err2) return res.status(500).json({ success: false, message: err2.message });
        res.json({ success: true });
      }
    );
  });
});

// ------------------ CHECK SESSION ------------------
router.get("/check-session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// ------------------ Profile ------------------

router.get("/user_profile", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(publicPath, "user_profile.html"));
  } else {
    res.redirect("/");
  }
});
router.get("/user_edit", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(publicPath, "user_edit.html"));
  } else {
    res.redirect("/");
  }
});

// ====================== UPDATE USER INFO ======================
router.post("/user_edit", upload.single("profile"), (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const userId = req.session.user.user_id; // ดึงจาก session
  const { name, email } = req.body;
  const profile = req.file ? "/uploads/" + req.file.filename : req.session.user.profile;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  pool.query(
    "UPDATE users SET name = ?, email = ?, profile = ? WHERE user_id = ?",
    [name, email, profile, userId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });

      // อัปเดต session ด้วยข้อมูลใหม่
      req.session.user.name = name;
      req.session.user.email = email;
      req.session.user.profile = profile;

      res.json({ success: true });
    }
  );
});

// GET transaction history
router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.json({ success: false, message: "User not logged in" });
    }

    const userId = req.session.userId;

    const [transactions] = await pool.promise().query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
      [userId]
    );

    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/transactions", async (req, res) => {
  if (!req.session.userId) return res.json({ success: false, message: "User not logged in" });

  const [transactions] = await pool.promise().query(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
    [req.session.userId]
  );

  res.json({ success: true, transactions });
});
router.post("/topup", async (req, res) => {
    console.log("Session:", req.session);
    const { amount } = req.body;
    if (!req.session.userId) return res.json({ success: false, message: "User not logged in" });

  await pool.promise().query(
    "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?",
    [amount, req.session.userId]
  );

  await pool.promise().query(
    "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'topup', ?, 'เติมเงิน')",
    [req.session.userId, amount]
  );

  res.json({ success: true, message: `Top-up ${amount} ฿ completed!` });
});

router.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT user_id, name, email FROM users WHERE role='user'");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// ------------------ LOGOUT ------------------
// logout API (POST)
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // ลบ cookie session
    res.json({ success: true });
  });
});

module.exports = router;
