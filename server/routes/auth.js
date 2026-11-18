const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { checkEmail, checkPassword } = require("../validation");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { password } = req.body || {};
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : req.body?.email;

    const error = checkEmail(email) || checkPassword(password);
    if (error) {
      return res.status(400).json({ error });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already used" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { password } = req.body || {};
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : req.body?.email;

    // Same message for every failure: we never reveal if an email exists.
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    const valid = user && (await bcrypt.compare(password, user.password_hash));
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
