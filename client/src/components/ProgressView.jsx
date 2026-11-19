import { computeStats, motivation } from "../utils/stats";
import CompletionChart from "./CompletionChart";

// The "Progress" tab, designed to fit on one screen:
// 1. streak + message and 3 numbers, 2. this week's chart, 3. next goal + badges.
export default function ProgressView({ tasks }) {
  const stats = computeStats(tasks);
  const message = motivation(stats);
  const weekDiff = stats.thisWeek - stats.lastWeek;

  return (
    <div className="progress-view">
      {/* 1. Streak + key numbers */}
      <section className="summary" aria-label="Summary">
        <div className={`streak-card${stats.streak > 0 ? " streak-card--on" : ""}`}>
          <div className="streak-card__count">
            <svg className="streak-card__flame" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path d="M12 2c1 3.5 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3 0-6 1-9z" />
            </svg>
            <span className="streak-card__number">{stats.streak}</span>
            <span className="streak-card__unit">{stats.streak === 1 ? "day" : "days"}</span>
          </div>
          <div className="streak-card__text">
            <h2>{message.title}</h2>
            <p>{message.text}</p>
          </div>
        </div>

        <dl className="kpis">
          <div className="kpi">
            <dt>This week</dt>
            <dd className="kpi__value">{stats.thisWeek}</dd>
            <dd className={`kpi__sub${weekDiff > 0 ? " kpi__sub--up" : ""}`}>
              {weekDiff === 0 ? "= last week" : `${weekDiff > 0 ? "↑ +" : "−"}${Math.abs(weekDiff)} vs last week`}
            </dd>
          </div>
          <div className="kpi">
            <dt>On time</dt>
            <dd className="kpi__value">{stats.onTimeRate === null ? "—" : `${stats.onTimeRate}%`}</dd>
            <dd className="kpi__sub">{stats.withDueDateCount ? `${stats.onTimeCount} of ${stats.withDueDateCount} dated` : "no due dates yet"}</dd>
          </div>
          <div className="kpi">
            <dt>Best streak</dt>
            <dd className="kpi__value">{stats.bestStreak}</dd>
            <dd className="kpi__sub">{stats.bestStreak === 1 ? "day" : "days"} in a row</dd>
          </div>
        </dl>
      </section>

      {/* 2. This week's chart */}
      <section className="panel chart-panel" aria-labelledby="chart-title">
        <div className="panel__head">
          <h2 id="chart-title">Completed this week</h2>
          <p className="muted">{stats.totalDone} of {stats.totalTasks} tasks done overall</p>
        </div>
        <CompletionChart days={stats.days} />
      </section>

      {/* 3. Next goal + badges on one line */}
      <section className="panel goals" aria-labelledby="goals-title">
        <div className="goals__next">
          <h2 id="goals-title" className="sr-only">Milestones</h2>
          {stats.nextMilestone ? (
            <>
              <div className="goals__label">
                <span>Next badge: <strong>{stats.nextMilestone.label}</strong></span>
                <span className="goals__count">{stats.nextMilestone.value} / {stats.nextMilestone.goal}</span>
              </div>
              <div
                className="goals__track"
                role="progressbar"
                aria-label={`${stats.nextMilestone.label}: ${stats.nextMilestone.detail}`}
                aria-valuemin={0}
                aria-valuemax={stats.nextMilestone.goal}
                aria-valuenow={stats.nextMilestone.value}
              >
                <div style={{ width: `${(stats.nextMilestone.value / stats.nextMilestone.goal) * 100}%` }} />
              </div>
              <p className="goals__hint">{stats.nextMilestone.detail}</p>
            </>
          ) : (
            <p className="goals__label"><strong>All badges unlocked. Impressive!</strong></p>
          )}
        </div>

        <ul className="badge-row">
          {stats.milestones.map((m) => (
            <li
              key={m.id}
              className={`badge-dot${m.unlocked ? " badge-dot--on" : ""}`}
              title={`${m.label}: ${m.detail}${m.unlocked ? " (unlocked)" : ""}`}
            >
              {m.unlocked ? (
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="currentColor" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
              )}
              <span className="sr-only">{m.label}, {m.detail}, {m.unlocked ? "unlocked" : "locked"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
