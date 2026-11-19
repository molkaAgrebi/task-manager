// Everything shown on the Progress page is computed here, from the task list.
// No extra API call is needed: each task has done, due_date and completed_at.
import { toDateString } from "./tasks";

const DAY = 86400000;

// "YYYY-MM-DD" n days before today (n = 0 is today)
function daysAgo(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // midday avoids daylight-saving surprises
  return toDateString(new Date(d.getTime() - n * DAY));
}

// Badges the user can unlock
export const MILESTONES = [
  { id: "first", label: "First step", detail: "Complete 1 task", type: "done", goal: 1 },
  { id: "five", label: "Warming up", detail: "Complete 5 tasks", type: "done", goal: 5 },
  { id: "ten", label: "On a roll", detail: "Complete 10 tasks", type: "done", goal: 10 },
  { id: "quarter", label: "Getting serious", detail: "Complete 25 tasks", type: "done", goal: 25 },
  { id: "fifty", label: "Task machine", detail: "Complete 50 tasks", type: "done", goal: 50 },
  { id: "streak3", label: "Three in a row", detail: "3-day streak", type: "streak", goal: 3 },
  { id: "streak7", label: "Full week", detail: "7-day streak", type: "streak", goal: 7 },
  { id: "streak30", label: "Unstoppable", detail: "30-day streak", type: "streak", goal: 30 },
];

export function computeStats(tasks) {
  const today = daysAgo(0);

  // How many tasks were completed on each day: { "2026-11-19": 3, ... }
  const perDay = {};
  for (const t of tasks) {
    if (t.done && t.completed_at) {
      const day = toDateString(new Date(t.completed_at));
      perDay[day] = (perDay[day] || 0) + 1;
    }
  }

  // Last 7 days, oldest first (for the chart)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = daysAgo(i);
    days.push({ date, count: perDay[date] || 0 });
  }

  // Current streak: consecutive days with at least one completed task.
  // If nothing is done yet today, the streak from yesterday still counts.
  let streak = 0;
  let offset = perDay[today] ? 0 : 1;
  while (perDay[daysAgo(offset)]) {
    streak++;
    offset++;
  }

  // Best streak ever
  const sortedDays = Object.keys(perDay).sort();
  let best = 0;
  let run = 0;
  let previous = null;
  for (const day of sortedDays) {
    const gap = previous ? Math.round((new Date(day) - new Date(previous)) / DAY) : null;
    run = gap === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  // This week (last 7 days) vs the 7 days before
  const sum = (from, to) => {
    let total = 0;
    for (let i = from; i <= to; i++) total += perDay[daysAgo(i)] || 0;
    return total;
  };
  const thisWeek = sum(0, 6);
  const lastWeek = sum(7, 13);

  // On time: finished on or before the due date
  const withDueDate = tasks.filter((t) => t.done && t.completed_at && t.due_date);
  const onTime = withDueDate.filter((t) => toDateString(new Date(t.completed_at)) <= t.due_date).length;
  const onTimeRate = withDueDate.length ? Math.round((onTime / withDueDate.length) * 100) : null;

  const totalDone = tasks.filter((t) => t.done).length;
  const overdue = tasks.filter((t) => !t.done && t.due_date && t.due_date < today).length;
  const doneToday = perDay[today] || 0;
  const bestDay = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);

  // Badges: unlocked or not, and progress towards each one
  const milestones = MILESTONES.map((m) => {
    const value = m.type === "done" ? totalDone : Math.max(best, streak);
    return { ...m, value: Math.min(value, m.goal), unlocked: value >= m.goal };
  });
  const nextMilestone = milestones.find((m) => !m.unlocked) || null;

  return {
    days,
    streak,
    bestStreak: Math.max(best, streak),
    thisWeek,
    lastWeek,
    onTimeRate,
    onTimeCount: onTime,
    withDueDateCount: withDueDate.length,
    totalDone,
    totalTasks: tasks.length,
    overdue,
    doneToday,
    bestDay,
    milestones,
    nextMilestone,
  };
}

// One encouraging sentence, chosen from the user's real situation.
export function motivation(stats) {
  if (stats.totalTasks === 0) {
    return { title: "Let's get started", text: "Add your first task, then check it off to start your streak." };
  }
  if (stats.streak >= 3 && stats.doneToday > 0) {
    return { title: `${stats.streak}-day streak!`, text: "You're building a real habit. Keep the chain going tomorrow." };
  }
  if (stats.streak >= 1 && stats.doneToday === 0) {
    return {
      title: "Keep your streak alive",
      text: `You're on a ${stats.streak}-day streak. Finish one task today to make it ${stats.streak + 1}.`,
    };
  }
  if (stats.doneToday >= 3) {
    return { title: "Productive day!", text: `${stats.doneToday} tasks done today. Take a moment to enjoy it.` };
  }
  if (stats.doneToday > 0) {
    return { title: "Nice progress", text: `${stats.doneToday} ${stats.doneToday === 1 ? "task" : "tasks"} done today. One more?` };
  }
  if (stats.overdue > 0) {
    return {
      title: "A fresh start",
      text: `${stats.overdue} ${stats.overdue === 1 ? "task is" : "tasks are"} overdue. Pick the smallest one and finish it first.`,
    };
  }
  return { title: "Ready when you are", text: "Finish one task today to start a new streak." };
}
