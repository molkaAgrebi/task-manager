// Helpers for dates, priorities, search and sorting.

export const PRIORITIES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

// A Date as "YYYY-MM-DD" in the user's own time zone.
export function toDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayString() {
  return toDateString(new Date());
}

// "YYYY-MM-DD" for today + n days
export function addDays(n) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return toDateString(date);
}

// Short text for a chosen date: "Today", "Tomorrow", "Yesterday" or "24 Nov"
export function shortDateLabel(dateString) {
  const days = daysFromToday(dateString);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Number of days between today and a "YYYY-MM-DD" date (negative = past).
function daysFromToday(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date - today) / 86400000);
}

// Text and style for the due date badge.
export function describeDueDate(dueDate, done) {
  if (!dueDate) return null;
  const days = daysFromToday(dueDate);
  const [y, m, d] = dueDate.split("-").map(Number);
  const pretty = new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  if (done) return { label: pretty, tone: "neutral" };
  if (days < 0) return { label: `Overdue · ${pretty}`, tone: "danger" };
  if (days === 0) return { label: "Due today", tone: "warning" };
  if (days === 1) return { label: "Due tomorrow", tone: "warning" };
  return { label: `Due ${pretty}`, tone: "neutral" };
}

export const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "due", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "A → Z" },
];

const byDate = (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id;

const COMPARE = {
  newest: byDate,
  oldest: (a, b) => -byDate(a, b),
  // Tasks without a date go last
  due: (a, b) => {
    if (a.due_date === b.due_date) return byDate(a, b);
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  },
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || byDate(a, b),
  title: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
};

// Applies filter + search + sort. Returns a new array (the original is untouched).
export function selectTasks(tasks, { filter, search, sort }) {
  const query = search.trim().toLowerCase();
  return tasks
    .filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done))
    .filter((t) => (query ? t.title.toLowerCase().includes(query) : true))
    .sort(COMPARE[sort]);
}
