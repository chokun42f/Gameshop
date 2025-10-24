const express = require("express");
const router = express.Router();
const pool = require("../../dbconn");

// Middleware ตรวจสอบ admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") next();
  else res.status(403).json({ message: "Forbidden" });
}

// Middleware ตรวจสอบ login
function isLoggedIn(req, res, next) {
  if (req.session.user && req.session.user.user_id) next();
  else res.status(401).json({ message: "Unauthorized: user not logged in" });
}

// ================== GET ALL CODES (Admin) ==================
router.get("/", isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      "SELECT * FROM codes ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================== ADD CODE ==================
router.post("/", isAdmin, async (req, res) => {
  try {
    const { code, discount_type, discount_value, max_uses } = req.body;
    if (!code || !discount_type || !discount_value || !max_uses) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await pool.promise().query(
      "INSERT INTO codes (code, discount_type, discount_value, max_uses) VALUES (?, ?, ?, ?)",
      [code, discount_type, discount_value, max_uses]
    );
    res.json({ message: "Code added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error or code already exists" });
  }
});

// ================== EDIT CODE ==================
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const codeId = req.params.id;
    const { code, discount_type, discount_value, max_uses } = req.body;
    if (!code || !discount_type || !discount_value || !max_uses) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await pool.promise().query(
      "UPDATE codes SET code = ?, discount_type = ?, discount_value = ?, max_uses = ? WHERE code_id = ?",
      [code, discount_type, discount_value, max_uses, codeId]
    );
    res.json({ message: "Code updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================== APPLY CODE (User) ==================
router.post("/apply", isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.user_id;
    const { code: codeInput } = req.body;  // rename เพื่อไม่ซ้ำกับ DB result

    // ดึงโค้ดจาก DB
    const [[codeData]] = await pool.promise().query(
      "SELECT * FROM codes WHERE code = ?",
      [codeInput]
    );

    if (!codeData) return res.status(404).json({ message: "Code not found" });

    // ตรวจสอบจำนวนครั้งใช้
    if (codeData.used_count >= codeData.max_uses) {
      return res.status(400).json({ message: "Code usage limit reached" });
    }

    // ตรวจสอบว่า user เคยใช้โค้ดนี้หรือไม่
    const [[usage]] = await pool.promise().query(
      "SELECT * FROM code_usage WHERE code_id = ? AND user_id = ?",
      [codeData.code_id, userId]
    );
    if (usage) return res.status(400).json({ message: "You have already used this code" });

    // เพิ่มลง code_usage
    await pool.promise().query(
      "INSERT INTO code_usage (code_id, user_id) VALUES (?, ?)",
      [codeData.code_id, userId]
    );

    // เพิ่ม used_count
    await pool.promise().query(
      "UPDATE codes SET used_count = used_count + 1 WHERE code_id = ?",
      [codeData.code_id]
    );

    res.json({
      message: "Code applied successfully",
      discount_type: codeData.discount_type,
      discount_value: codeData.discount_value
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
