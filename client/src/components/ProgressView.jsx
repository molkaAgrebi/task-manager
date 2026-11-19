import { computeStats, motivation } from "../utils/stats";
import CompletionChart from "./CompletionChart";

// The "Progress" tab: motivation, key numbers, chart and badges.
export default function ProgressView({ tasks }) {
  const stats = computeStats(tasks);
  const message = motivation(stats);
  const weekDiff = stats.thisWeek - stats.lastWeek;
  const bestDayLabel = stats.bestDay.count
    ? new Date(stats.bestDay.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    : null;

  return (
    <div className="progress-view">
      {/* 1. Motivation + streak */}
      <section className="hero-card" aria-label="Your streak">
        <div className="hero-card__text">
          <h2>{message.title}</h2>
          <p>{message.text}</p>
        </div>
        <div className={`streak${stats.streak > 0 ? " streak--on" : ""}`}>
          <svg className="streak__flame" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path d="M12 2c1 3.5 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 0-6 1-9z" />
          </svg>
          <span className="streak__number">{stats.streak}</span>
          <span className="streak__label">day streak</span>
        </div>
      </section>

      {/* 2. Key numbers */}
      <dl className="kpis">
        <div className="kpi">
          <dt>This week</dt>
          <dd className="kpi__value">{stats.thisWeek}</dd>
          <dd className={`kpi__sub${weekDiff > 0 ? " kpi__sub--up" : ""}`}>
            {weekDiff > 0 && <span aria-hidden="true">↑ </span>}
            {weekDiff === 0 ? "Same as last week" : `${weekDiff > 0 ? "+" : "−"}${Math.abs(weekDiff)} vs last week`}
          </dd>
        </div>
        <div className="kpi">
          <dt>Best streak</dt>
          <dd className="kpi__value">{stats.bestStreak}<small> {stats.bestStreak === 1 ? "day" : "days"}</small></dd>
          <dd className="kpi__sub">{stats.streak === stats.bestStreak && stats.streak > 0 ? "You're on it right now" : "Your record so far"}</dd>
        </div>
        <div className="kpi">
          <dt>On time</dt>
          <dd className="kpi__value">{stats.onTimeRate === null ? "—" : `${stats.onTimeRate}%`}</dd>
          <dd className="kpi__sub">
            {stats.withDueDateCount ? `${stats.onTimeCount} of ${stats.withDueDateCount} with a due date` : "Add due dates to track this"}
          </dd>
        </div>
        <div className="kpi">
          <dt>Completed</dt>
          <dd className="kpi__value">{stats.totalDone}</dd>
          <dd className="kpi__sub">out of {stats.totalTasks} {stats.totalTasks === 1 ? "task" : "tasks"}</dd>
        </div>
      </dl>

      {/* 3. Chart */}
      <section className="panel" aria-labelledby="chart-title">
        <div className="panel__head">
          <h2 id="chart-title">Completed per day</h2>
          <p className="muted">
            Last 14 days{bestDayLabel ? ` · best day: ${bestDayLabel} (${stats.bestDay.count})` : ""}
          </p>
        </div>
        <CompletionChart days={stats.days} />
      </section>

      {/* 4. Badges */}
      <section className="panel" aria-labelledby="badges-title">
        <div className="panel__head">
          <h2 id="badges-title">Milestones</h2>
          <p className="muted">
            {stats.milestones.filter((m) => m.unlocked).length} of {stats.milestones.length} unlocked
          </p>
        </div>

        {stats.nextMilestone && (
          <div className="next-goal">
            <div className="next-goal__label">
              <span>Next: <strong>{stats.nextMilestone.label}</strong> · {stats.nextMilestone.detail}</span>
              <span className="next-goal__count">{stats.nextMilestone.value} / {stats.nextMilestone.goal}</span>
            </div>
            <div
              className="next-goal__track"
              role="progressbar"
              aria-label={`Progress towards ${stats.nextMilestone.label}`}
              aria-valuemin={0}
              aria-valuemax={stats.nextMilestone.goal}
              aria-valuenow={stats.nextMilestone.value}
            >
              <div style={{ width: `${(stats.nextMilestone.value / stats.nextMilestone.goal) * 100}%` }} />
            </div>
          </div>
        )}

        <ul className="badges">
          {stats.milestones.map((m) => (
            <li key={m.id} className={`badge-tile${m.unlocked ? " badge-tile--on" : ""}`}>
              <span className="badge-tile__icon" aria-hidden="true">
                {m.unlocked ? (
                  <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="currentColor" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                )}
              </span>
              <span className="badge-tile__text">
                <strong>{m.label}</strong>
                <span>{m.detail}</span>
              </span>
              <span className="sr-only">{m.unlocked ? "Unlocked" : "Locked"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
