const express = require("express");
const router = express.Router();
const pool = require("../../dbconn");

// GET /api/library?search=&type=
// GET /api/library?search=&type=
router.get("/library", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { search = "", type = "" } = req.query;
    let sql = `SELECT l.game_id, g.name, g.type, g.price, g.profile AS image_url, l.purchased_at
               FROM library l
               JOIN games g ON l.game_id = g.game_id
               WHERE l.user_id = ?`;
    const params = [req.session.userId];

    if (search) {
      sql += " AND g.name LIKE ?";
      params.push(`%${search}%`);
    }
    if (type) {
      sql += " AND g.type = ?";
      params.push(type);
    }

    sql += " ORDER BY l.purchased_at DESC";

    const [games] = await pool.promise().query(sql, params);
    res.json(games);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
