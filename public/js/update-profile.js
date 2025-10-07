router.post("/update-profile", upload.single("profile"), (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: "Not logged in" });

  const profileFile = req.file ? "/uploads/" + req.file.filename : null;

  pool.query(
    "UPDATE users SET profile = ? WHERE id = ?",
    [profileFile, req.session.user.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      // อัปเดต session ด้วย
      req.session.user.profile = profileFile;
      res.json({ success: true });
    }
  );
});
