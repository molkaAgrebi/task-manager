// Creates or updates the tables by running schema.sql.
// Usage: npm run migrate
const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Database schema is up to date");
}

// Run directly from the command line
if (require.main === module) {
  migrate()
    .then(() => pool.end())
    .catch((err) => {
      console.error("Migration failed:", err.message);
      process.exit(1);
    });
}

module.exports = migrate;
