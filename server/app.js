require("dotenv").config({ quiet: true });
const express = require("express"); // the tool that creates the server
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const requireAuth = require("./middleware/auth");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing: add it to the .env file");
}

const app = express();

// Behind a hosting proxy (Render, Railway...), this gives the real visitor IP
// to the rate limiter. Set TRUST_PROXY=1 there.
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY));
}

// Security headers (no "X-Powered-By: Express", no sniffing, etc.)
app.use(helmet());

// Only our front end may call the API from a browser.
// CLIENT_ORIGIN can hold several addresses separated by commas.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins }));

// Refuse very large bodies (a task is only a few hundred bytes).
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.json({ message: "Task manager API is running" });
});

// Health check: used by Docker and the hosting platform.
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: "error", error: "Database unavailable" });
  }
});

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/me", requireAuth, (req, res) => {
  res.json({ message: "You are logged in", userId: req.user.id });
});

// Unknown address
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Any unexpected error (for example invalid JSON in the body)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large" });
  }
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

module.exports = app;
