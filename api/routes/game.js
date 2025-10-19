const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require("../../dbconn");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");

// ดึงเกมทั้งหมด หรือ filter ตาม type / search
router.get("/", async (req, res) => {
  try {
    let sql = "SELECT game_id, name, type, price, profile AS image_url, sales_count FROM games";
    const params = [];
    
    if (req.query.type) {
      sql += " WHERE type = ?";
      params.push(req.query.type);
    }
    if (req.query.search) {
      sql += params.length ? " AND name LIKE ?" : " WHERE name LIKE ?";
      params.push(`%${req.query.search}%`);
    }

    const [rows] = await pool.promise().query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ตั้งค่า multer สำหรับ upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/image_game"));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// เพิ่มเกมใหม่
router.post("/add", upload.single("profile"), async (req, res) => {
  try {
    const { name, type, price, detail } = req.body;
    const imagePath = `/image_game/${req.file.filename}`;

    const sql = `
      INSERT INTO games (name, type, price, profile, detail, sales_count)
      VALUES (?, ?, ?, ?, ?, 0)
    `;
    await pool.promise().query(sql, [name, type, price, imagePath, detail]);

    res.json({ message: "Game added successfully!" });
  } catch (err) {
    console.error("Error adding game:", err);
    res.status(500).json({ message: "Server error while adding game" });
  }
});

// ดึงประเภทเกม
router.get("/types", async (req, res) => {
  try {
    const [rows] = await pool.promise().query("SELECT DISTINCT type FROM games ORDER BY type ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching game types:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ดึงเกมยอดนิยม
router.get("/popular", async (req, res) => {
  try {
    const [rows] = await pool.promise().query(`
      SELECT game_id, name, type, price, profile AS image_url, sales_count
      FROM games
      ORDER BY sales_count DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching popular games:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ดึงข้อมูลเกมตาม ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.promise().query("SELECT * FROM games WHERE game_id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Game not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
// อัปเดตข้อมูลเกม (PUT)
router.put("/:id", upload.single("profile"), async (req, res) => {
  const { id } = req.params;
  const { name, type, release_date, price, detail } = req.body;

  try {
    // ดึงข้อมูลเกมเดิมมาเช็กก่อน
    const [rows] = await pool.promise().query("SELECT profile FROM games WHERE game_id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Game not found" });

    // ถ้ามีอัปโหลดรูปใหม่
    let imagePath = rows[0].profile;
    if (req.file) {
      imagePath = `/image_game/${req.file.filename}`;
    }

    // อัปเดตข้อมูล
    const sql = `
      UPDATE games
      SET name = ?, type = ?, release_date = ?, price = ?, detail = ?, profile = ?
      WHERE game_id = ?
    `;
    await pool.promise().query(sql, [name, type, release_date, price, detail, imagePath, id]);

    res.json({ message: "Game updated successfully!" });
  } catch (err) {
    console.error("Error updating game:", err);
    res.status(500).json({ message: "Server error while updating game" });
  }
});


// ลบเกม (DELETE)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.promise().query("DELETE FROM games WHERE game_id = ?", [id]);
    if (rows.affectedRows === 0) return res.status(404).json({ message: "Game not found" });
    res.json({ message: "Game deleted successfully!" });
  } catch (err) {
    console.error("Error deleting game:", err);
    res.status(500).json({ message: "Server error while deleting game" });
  }
});
// File: api/routes/game.js
router.post("/update-sales", async (req, res) => {
    const items = req.body.items; // [{game_id, quantity}, ...]
    if (!items || !Array.isArray(items)) return res.status(400).json({ success: false, message: "Invalid items" });

    try {
        for (const item of items) {
            await pool.promise().query(
                "UPDATE games SET sales_count = sales_count + ? WHERE game_id = ?",
                [item.quantity, item.game_id]
            );
        }
        res.json({ success: true, message: "Sales updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



module.exports = router;
