const express = require("express");
const router = express.Router();
const pool = require("../../dbconn");

// ตรวจสอบ session user
function isLoggedIn(req, res, next) {
    if (req.session.userId) next();
    else res.status(401).json({ success: false, message: "User not logged in" });
}

// GET wallet balance
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const [[user]] = await pool.promise().query(
            "SELECT wallet_balance FROM users WHERE user_id = ?",
            [req.session.userId]
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, wallet_balance: parseFloat(user.wallet_balance) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// POST เติมเงิน
router.post("/topup", isLoggedIn, async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.json({ success: false, message: "จำนวนเงินไม่ถูกต้อง" });

    try {
        // อัปเดต wallet
        await pool.promise().query(
            "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?",
            [amount, req.session.userId]
        );

        // เพิ่ม transaction
        await pool.promise().query(
            "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'topup', ?, 'เติมเงิน')",
            [req.session.userId, amount]
        );

        res.json({ success: true, message: `เติมเงิน ${amount} ฿ เรียบร้อย!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
