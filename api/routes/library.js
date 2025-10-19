const express = require("express");
const router = express.Router();
const pool = require("../../dbconn");

// ✅ ดึงเกมทั้งหมดในคลังของผู้ใช้ (JOIN กับ games)
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await pool.promise().query(
      `SELECT g.game_id, g.name, g.type, g.price, g.profile, g.release_date 
       FROM library l
       JOIN games g ON l.game_id = g.game_id
       WHERE l.user_id = ?`,
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching library:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
