import { useState } from "react";
import { PRIORITIES } from "../utils/tasks";

// The "new task" form: title + priority + optional due date.
// onAdd({ title, priority, due_date }) must return a promise.
export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setAdding(true);
    try {
      await onAdd({ title: title.trim(), priority, due_date: dueDate || null });
      // Reset only on success, so nothing is lost if the API fails.
      setTitle("");
      setPriority("medium");
      setDueDate("");
    } catch {
      // The error toast is shown by the dashboard.
    } finally {
      setAdding(false);
    }
  }

  return (
    <form className="add-task glass" onSubmit={handleSubmit}>
      <div className="add-task__main">
        <label htmlFor="new-task" className="sr-only">New task</label>
        <span className="add-task__plus" aria-hidden="true">+</span>
        <input
          id="new-task"
          type="text"
          placeholder="What do you need to do?"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="btn btn--primary" disabled={adding || !title.trim()} aria-busy={adding}>
          {adding && <span className="spinner" aria-hidden="true" />}
          {adding ? "Adding…" : "Add task"}
        </button>
      </div>

      <div className="add-task__options">
        <label className="mini-field">
          <span>Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <label className="mini-field">
          <span>Due date</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        {dueDate && (
          <button type="button" className="link-btn add-task__clear" onClick={() => setDueDate("")}>
            Clear date
          </button>
        )}
      </div>
    </form>
  );
}
