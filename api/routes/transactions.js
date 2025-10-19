const express = require("express");
const router = express.Router();
const pool = require("../../dbconn");

// เพิ่ม transaction
router.post("/add", async (req, res) => {
    try {
        const { type, amount, description } = req.body;

        if (!req.session.userId) return res.status(401).json({ success: false, message: "User not logged in" });

        const userId = req.session.userId;

        await pool.promise().query(
            "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)",
            [userId, type, amount, description]
        );

        res.json({ success: true, message: "Transaction added" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ดึง transaction ของผู้ใช้
router.get("/", async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ success: false, message: "User not logged in" });

        const userId = req.session.userId;

        const [rows] = await pool.promise().query(
            "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        res.json({ success: true, transactions: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
