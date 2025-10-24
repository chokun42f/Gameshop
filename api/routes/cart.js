// File: api/routes/cart.js
const express = require("express");
const router = express.Router();
const pool = require("../../dbconn");

// ------------------ Middleware ------------------
function checkSession(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    next();
}

// ------------------ GET /api/cart ------------------
// ดึงรายการเกมในตะกร้า
router.get("/", checkSession, async (req, res) => {
    try {
        const userId = req.session.userId;
        const [rows] = await pool.promise().query(`
            SELECT ci.game_id, g.name, g.type, g.price, g.profile AS image_url, ci.quantity
            FROM cart c
            JOIN cart_items ci ON ci.cart_id = c.cart_id
            JOIN games g ON ci.game_id = g.game_id
            WHERE c.user_id = ?
        `, [userId]);

        res.json({ success: true, cart: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ------------------ POST /api/cart/add ------------------
// เพิ่มเกมลงตะกร้า
router.post("/add", checkSession, async (req, res) => {
    try {
        const { game_id, quantity } = req.body;
        const userId = req.session.userId;

        // ตรวจสอบว่าเกมอยู่ใน library แล้วหรือยัง
        const [owned] = await pool.promise().query(
            "SELECT * FROM library WHERE user_id = ? AND game_id = ?",
            [userId, game_id]
        );
        if (owned.length > 0)
            return res.json({ success: false, message: "คุณมีเกมนี้อยู่แล้วใน Library!" });

        // ตรวจสอบเกมในตะกร้า
        const [cartItem] = await pool.promise().query(
            "SELECT * FROM cart_items WHERE cart_id = (SELECT cart_id FROM cart WHERE user_id = ?) AND game_id = ?",
            [userId, game_id]
        );
        if (cartItem.length > 0)
            return res.json({ success: false, message: "เกมนี้อยู่ในตะกร้าแล้ว" });

        // หา cart_id
        const [[cart]] = await pool.promise().query(
            "SELECT cart_id FROM cart WHERE user_id = ?", [userId]
        );
        if (!cart) return res.status(400).json({ success: false, message: "Cart not found" });

        // เพิ่มเกมลง cart
        await pool.promise().query(
            "INSERT INTO cart_items (cart_id, game_id, quantity) VALUES (?, ?, ?)",
            [cart.cart_id, game_id, quantity || 1]
        );

        res.json({ success: true, message: "เพิ่มเกมลงในตะกร้าแล้ว!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ------------------ DELETE /api/cart/remove/:gameId ------------------
router.delete("/remove/:gameId", checkSession, async (req, res) => {
    try {
        const userId = req.session.userId;
        const gameId = parseInt(req.params.gameId);
        if (isNaN(gameId)) return res.status(400).json({ success: false, message: "gameId ต้องเป็นตัวเลข" });

        const [[cart]] = await pool.promise().query(
            "SELECT * FROM cart WHERE user_id = ?", [userId]
        );
        if (!cart) return res.json({ success: false, message: "ตะกร้าว่าง" });

        await pool.promise().query(
            "DELETE FROM cart_items WHERE cart_id = ? AND game_id = ?", [cart.cart_id, gameId]
        );

        res.json({ success: true, message: "ลบเกมออกจากตะกร้าเรียบร้อย" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะลบเกม" });
    }
});

// ------------------ POST /api/cart/checkout ------------------
router.post("/checkout", checkSession, async (req, res) => {
    const conn = await pool.promise().getConnection();
    try {
        const userId = req.session.userId;
        const { discount_code } = req.body;

        await conn.beginTransaction();

        const [cartItems] = await conn.query(`
            SELECT ci.game_id, ci.quantity, g.price, g.name
            FROM cart c
            JOIN cart_items ci ON ci.cart_id = c.cart_id
            JOIN games g ON ci.game_id = g.game_id
            WHERE c.user_id = ?
        `, [userId]);

        if (cartItems.length === 0) {
            await conn.rollback();
            return res.json({ success: false, message: "ตะกร้าว่าง" });
        }

        const [[user]] = await conn.query("SELECT wallet_balance FROM users WHERE user_id = ?", [userId]);
        let totalPrice = cartItems.reduce((sum, g) => sum + g.price * g.quantity, 0);

        // Apply discount code
        if (discount_code) {
            const [[code]] = await conn.query("SELECT * FROM codes WHERE code = ?", [discount_code]);
            if (!code) {
                await conn.rollback();
                return res.json({ success: false, message: "Code not found" });
            }

            if (code.used_count >= code.max_uses) {
                await conn.rollback();
                return res.json({ success: false, message: "Code usage limit reached" });
            }

            if (code.discount_type === "percent") totalPrice -= totalPrice * (code.discount_value / 100);
            else totalPrice -= code.discount_value;

            totalPrice = Math.max(totalPrice, 0);

            // เพิ่ม record code_usage
            await conn.query("INSERT INTO code_usage (code_id, user_id) VALUES (?, ?)", [code.code_id, userId]);
            await conn.query("UPDATE codes SET used_count = used_count + 1 WHERE code_id = ?", [code.code_id]);
        }

        if (user.wallet_balance < totalPrice) {
            await conn.rollback();
            return res.json({ success: false, message: "ยอดเงินไม่เพียงพอ" });
        }

        await conn.query("UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?", [totalPrice, userId]);
        await conn.query("INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)",
            [userId, "purchase", totalPrice, `Bought ${cartItems.map(g => g.name).join(", ")}`]);

        const libraryValues = cartItems.map(g => [userId, g.game_id]);
        await conn.query("INSERT INTO library (user_id, game_id) VALUES ?", [libraryValues]);
        await conn.query("DELETE ci FROM cart_items ci JOIN cart c ON ci.cart_id = c.cart_id WHERE c.user_id = ?", [userId]);

        await conn.commit();
        res.json({ success: true, message: "ซื้อเกมเรียบร้อย!", totalAmount: totalPrice, items: cartItems });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะซื้อเกม" });
    } finally {
        conn.release();
    }
});


// ------------------ POST /api/wallet/topup ------------------
// เติมเงิน wallet
router.post("/topup", checkSession, async (req, res) => {
    const conn = await pool.promise().getConnection();
    try {
        const userId = req.session.userId;
        const { amount } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "จำนวนเงินไม่ถูกต้อง" });

        await conn.beginTransaction();

        // เพิ่มเงิน wallet
        await conn.query(
            "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?",
            [amount, userId]
        );

        // เพิ่ม transaction
        await conn.query(
            "INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)",
            [userId, "topup", amount, "Wallet Top-up"]
        );

        await conn.commit();

        res.json({ success: true, message: `เติมเงิน ${amount} ฿ เรียบร้อย` });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะเติมเงิน" });
    } finally {
        conn.release();
    }
});

module.exports = router;
