const express = require("express");
const router = express.Router();
const pool = require("../../dbconn");

router.get("/", (req, res) => {
  if (!req.session.userId) return res.json({ loggedIn: false });

  const userId = req.session.userId;

  pool.query(
    "SELECT name, profile, email, role FROM users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ loggedIn: false, message: err.message });
      if (results.length === 0) return res.json({ loggedIn: false });

      res.json({
        loggedIn: true,
        user: {
          id: userId,
          name: results[0].name,
          profile: results[0].profile,
          email: results[0].email,
          role: results[0].role
        }
      });
    }
  );
});

module.exports = router;
