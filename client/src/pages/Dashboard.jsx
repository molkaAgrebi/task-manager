import { useEffect, useState } from "react";
import { api } from "../api";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import Stats from "../components/Stats";
import AddTaskForm from "../components/AddTaskForm";
import Filters from "../components/Filters";
import Toolbar from "../components/Toolbar";
import TaskItem from "../components/TaskItem";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import { selectTasks } from "../utils/tasks";

export default function Dashboard({ token, email, onLogout, notify }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "todo" | "done"
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // If the token expired, the API answers 401: we log the user out.
  function handleError(err) {
    if (err.status === 401) onLogout("Your session expired, please log in again");
    else notify(err.message, "error");
  }

  // Replaces one task in the list with a new version.
  function replaceTask(updated) {
    setTasks((list) => list.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function loadTasks() {
    setLoading(true);
    setLoadError("");
    try {
      setTasks(await api.getTasks(token));
    } catch (err) {
      if (err.status === 401) onLogout("Your session expired, please log in again");
      else setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Load the tasks once, when the dashboard appears.
  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called by AddTaskForm. Throws if it fails, so the form keeps its content.
  async function handleAdd(newTask) {
    try {
      const task = await api.addTask(token, newTask);
      setTasks((list) => [task, ...list]);
      notify("Task added");
    } catch (err) {
      handleError(err);
      throw err;
    }
  }

  // Optimistic update: the checkbox changes at once, and goes back if the API fails.
  async function handleToggle(task) {
    replaceTask({ ...task, done: !task.done });
    try {
      replaceTask(await api.updateTask(token, task.id, { done: !task.done }));
    } catch (err) {
      replaceTask(task);
      handleError(err);
    }
  }

  // Called by the edit form. Throws if it fails, so the form stays open.
  async function handleUpdate(task, changes) {
    try {
      replaceTask(await api.updateTask(token, task.id, changes));
      notify("Task updated");
    } catch (err) {
      handleError(err);
      throw err;
    }
  }

  // Called by TaskItem after its exit animation. Throws if it fails,
  // so the card can come back.
  async function handleDelete(task) {
    try {
      await api.deleteTask(token, task.id);
      setTasks((list) => list.filter((t) => t.id !== task.id));
      notify("Task deleted");
    } catch (err) {
      handleError(err);
      throw err;
    }
  }

  const doneCount = tasks.filter((t) => t.done).length;
  const counts = { all: tasks.length, todo: tasks.length - doneCount, done: doneCount };
  const visible = selectTasks(tasks, { filter, search, sort });

  return (
    <div className="dashboard">
      <div className="backdrop" aria-hidden="true" />

      <header className="topbar">
        <Logo />
        <div className="topbar__actions">
          <span className="user-chip" title={email || ""}>
            <span className="user-chip__avatar" aria-hidden="true">
              {(email || "?").charAt(0).toUpperCase()}
            </span>
            <span className="user-chip__email">{email}</span>
          </span>
          <ThemeToggle />
          <button type="button" className="btn btn--ghost" onClick={() => onLogout()}>
            Log out
          </button>
        </div>
      </header>

      <main className="board">
        {/* Title on the left, progress on the right */}
        <div className="board__head">
          <section className="board__intro">
            <h1>Your tasks</h1>
            <p className="muted">
              {loading
                ? "Loading your list…"
                : counts.todo === 0 && counts.all > 0
                ? "Everything is done. Nice work!"
                : `${counts.todo} ${counts.todo === 1 ? "task" : "tasks"} left to do.`}
            </p>
          </section>
          <Stats total={counts.all} done={counts.done} />
        </div>

        <AddTaskForm onAdd={handleAdd} />

        <div className="controls">
          <Filters value={filter} onChange={setFilter} counts={counts} />
          <Toolbar search={search} onSearch={setSearch} sort={sort} onSort={setSort} />
        </div>

        <section className="board__list" aria-label="Task list" aria-busy={loading}>
          {loading ? (
            <Skeleton />
          ) : loadError ? (
            <div className="load-error glass" role="alert">
              <p>{loadError}</p>
              <button type="button" className="btn btn--ghost" onClick={loadTasks}>Try again</button>
            </div>
          ) : visible.length === 0 ? (
            <EmptyState filter={filter} search={search.trim()} onClearSearch={() => setSearch("")} />
          ) : (
            <ul className="task-list">
              {visible.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
