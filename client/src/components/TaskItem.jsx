import { useEffect, useRef, useState } from "react";
import { PRIORITIES, describeDueDate } from "../utils/tasks";

const EXIT_DURATION = 220; // ms, same as the CSS animation

export default function TaskItem({ task, index, onToggle, onUpdate, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const timer = useRef(null);

  // Clean the timer if the card disappears.
  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleDeleteClick() {
    // 1st click: ask for confirmation for 3 seconds.
    if (!confirming) {
      setConfirming(true);
      timer.current = setTimeout(() => setConfirming(false), 3000);
      return;
    }
    // 2nd click: play the exit animation, then delete.
    clearTimeout(timer.current);
    setLeaving(true);
    await new Promise((resolve) => setTimeout(resolve, EXIT_DURATION));
    try {
      await onDelete(task);
    } catch {
      // The API failed: show the card again.
      setLeaving(false);
      setConfirming(false);
    }
  }

  if (editing) {
    return (
      <li className="task task--editing glass">
        <EditForm
          task={task}
          onCancel={() => setEditing(false)}
          onSave={async (changes) => {
            await onUpdate(task, changes); // throws if it fails -> stay in edit mode
            setEditing(false);
          }}
        />
      </li>
    );
  }

  const due = describeDueDate(task.due_date, task.done);
  const priority = PRIORITIES.find((p) => p.value === task.priority);

  return (
    <li
      className={`task glass${task.done ? " task--done" : ""}${leaving ? " task--leaving" : ""}`}
      style={{ "--i": Math.min(index, 8) }} // used for the staggered entrance
    >
      <label className="checkbox">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task)}
          disabled={leaving}
        />
        <span className="checkbox__box" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <span className="task__body">
          <span className="task__title">{task.title}</span>
          <span className="task__meta">
            <span className={`badge badge--${task.priority}`}>
              <span className="badge__dot" aria-hidden="true" />
              {priority?.label} priority
            </span>
            {due && <span className={`badge badge--${due.tone}`}>{due.label}</span>}
          </span>
        </span>
      </label>

      <div className="task__actions">
        <button
          type="button"
          className="icon-action"
          onClick={() => setEditing(true)}
          disabled={leaving}
          aria-label={`Edit "${task.title}"`}
          title="Edit"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          className={`icon-action delete-btn${confirming ? " delete-btn--confirm" : ""}`}
          onClick={handleDeleteClick}
          disabled={leaving}
          aria-label={confirming ? `Confirm deleting "${task.title}"` : `Delete "${task.title}"`}
          title="Delete"
        >
          {confirming ? (
            <span>Confirm?</span>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </li>
  );
}

// Inline form to edit title, priority and due date.
// Enter saves, Escape cancels.
function EditForm({ task, onSave, onCancel }) {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const id = `edit-${task.id}`;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    // Only send what changed.
    const changes = {};
    if (title.trim() !== task.title) changes.title = title.trim();
    if (priority !== task.priority) changes.priority = priority;
    if ((dueDate || null) !== task.due_date) changes.due_date = dueDate || null;
    if (Object.keys(changes).length === 0) return onCancel();

    setSaving(true);
    try {
      await onSave(changes);
    } catch {
      setSaving(false);
    }
  }

  return (
    <form
      className="edit-form"
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      aria-label={`Edit task "${task.title}"`}
    >
      <label htmlFor={`${id}-title`} className="sr-only">Title</label>
      <input
        ref={inputRef}
        id={`${id}-title`}
        className="edit-form__title"
        type="text"
        value={title}
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="edit-form__row">
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
        <div className="edit-form__buttons">
          <button type="button" className="btn btn--ghost btn--small" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn--primary btn--small" disabled={saving || !title.trim()}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
