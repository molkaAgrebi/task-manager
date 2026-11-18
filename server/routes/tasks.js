const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/auth");
const { checkTitle, checkPriority, checkDueDate } = require("../validation");

const router = express.Router();

// Columns sent back to the front end
const COLUMNS = "id, title, done, priority, due_date, created_at";

// Every route in this file requires a valid token.
// After this line, req.user.id is the id of the logged-in user.
router.use(requireAuth);

// Checks that the :id in the URL is a positive whole number.
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /tasks -> list the tasks of the logged-in user only
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM tasks WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /tasks -> create a task for the logged-in user
// Body: { title, priority?, due_date? }
router.post("/", async (req, res) => {
  try {
    const { title, priority = "medium", due_date = null } = req.body || {};

    const error = checkTitle(title) || checkPriority(priority) || checkDueDate(due_date);
    if (error) {
      return res.status(400).json({ error });
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, priority, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNS}`,
      [req.user.id, title.trim(), priority, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /tasks/:id -> change one or more fields of one task
// Body: any of { title, done, priority, due_date } (due_date: null removes the date)
router.put("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const body = req.body || {};
    const changes = []; // e.g. ["title = $1", "done = $2"]
    const values = [];

    // Column names come from this fixed list, never from the user.
    // Only the values are sent as parameters ($1, $2...).
    function addChange(column, value) {
      values.push(value);
      changes.push(`${column} = $${values.length}`);
    }

    if (body.title !== undefined) {
      const error = checkTitle(body.title);
      if (error) return res.status(400).json({ error });
      addChange("title", body.title.trim());
    }
    if (body.done !== undefined) {
      if (typeof body.done !== "boolean") {
        return res.status(400).json({ error: "Done must be true or false" });
      }
      addChange("done", body.done);
    }
    if (body.priority !== undefined) {
      const error = checkPriority(body.priority);
      if (error) return res.status(400).json({ error });
      addChange("priority", body.priority);
    }
    if (body.due_date !== undefined) {
      const error = checkDueDate(body.due_date);
      if (error) return res.status(400).json({ error });
      addChange("due_date", body.due_date);
    }

    if (changes.length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    // "AND user_id = ..." makes sure a user can only edit their own tasks.
    values.push(id, req.user.id);
    const result = await pool.query(
      `UPDATE tasks SET ${changes.join(", ")}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING ${COLUMNS}`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /tasks/:id -> delete one task of the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
