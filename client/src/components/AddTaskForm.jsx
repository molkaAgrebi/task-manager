import { useState } from "react";
import { PRIORITIES } from "../utils/tasks";
import Menu from "./Menu";
import DatePicker from "./DatePicker";

// The "new task" bar: title + priority + optional due date, all on one line.
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
    <form className="composer" onSubmit={handleSubmit}>
      <label htmlFor="new-task" className="sr-only">New task</label>
      <input
        id="new-task"
        className="composer__input"
        type="text"
        placeholder="Add a task…"
        value={title}
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
        autoComplete="off"
      />
      <div className="composer__tools">
        <Menu label="Priority" value={priority} options={PRIORITIES} onChange={setPriority} dots />
        <DatePicker value={dueDate} onChange={setDueDate} />
        <button type="submit" className="btn btn--primary composer__add" disabled={adding || !title.trim()} aria-busy={adding}>
          {adding ? <span className="spinner" aria-hidden="true" /> : <span aria-hidden="true">+</span>}
          {adding ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}
