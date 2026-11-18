-- Database schema for the task manager.
-- Safe to run many times: "IF NOT EXISTS" skips what already exists.
-- Run it with:  npm run migrate

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id         SERIAL PRIMARY KEY,
  -- ON DELETE CASCADE: deleting a user also deletes their tasks
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  done       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Added later: due date and priority
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(10) NOT NULL DEFAULT 'medium'
  CHECK (priority IN ('low', 'medium', 'high'));

-- Speeds up "WHERE user_id = $1", used by every task query
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
