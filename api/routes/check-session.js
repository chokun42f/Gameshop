router.get("/check-session", (req, res) => {
  if (!req.session.user) {
    return res.json({ loggedIn: false });
  }

  const userId = req.session.user.id;

  pool.query("SELECT name, profile FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ loggedIn: false, message: err.message });
    if (results.length === 0) return res.json({ loggedIn: false });

    res.json({
      loggedIn: true,
      user: {
        id: userId,
        email: req.session.user.email,
        role: req.session.user.role,
        name: results[0].name,
        profile: results[0].profile
      }
    });
  });
});
