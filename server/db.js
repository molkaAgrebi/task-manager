require("dotenv").config({ quiet: true });
const { Pool, types } = require("pg");

// Return DATE columns as plain text ("2026-11-20") instead of a JS Date,
// so the due date never shifts because of time zones.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Hosted databases (Render, Neon...) require SSL: set DB_SSL=true there.
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
