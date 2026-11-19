import { useState } from "react";

// Bar chart: tasks completed per day over the last 7 days.
// One series, so no legend: the card title names it.
// Hover (or keyboard focus) on a day shows a tooltip.
export default function CompletionChart({ days }) {
  const [active, setActive] = useState(null);

  const max = Math.max(...days.map((d) => d.count), 1);
  // A round top value for the scale: 1-4 as is, then the next even number
  const top = max <= 4 ? max : Math.ceil(max / 2) * 2;
  const lastIndex = days.length - 1;

  const pretty = (date, options) =>
    new Date(date + "T12:00:00").toLocaleDateString("en-GB", options);

  return (
    <figure className="chart">
      <div className="chart__plot" onMouseLeave={() => setActive(null)}>
        {/* Recessive grid: top value, middle, baseline */}
        <div className="chart__grid" aria-hidden="true">
          <span style={{ bottom: "100%" }}><em>{top}</em></span>
          {top > 1 && <span style={{ bottom: "50%" }}><em>{top / 2}</em></span>}
          <span className="chart__baseline" style={{ bottom: 0 }}><em>0</em></span>
        </div>

        <div className="chart__bars">
          {days.map((d, i) => (
            <div
              key={d.date}
              className={`chart__col${active === i ? " chart__col--active" : ""}`}
              tabIndex={0}
              aria-label={`${pretty(d.date, { weekday: "long", day: "numeric", month: "long" })}: ${d.count} completed`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              {/* Direct label only on the best day */}
              {d.count === max && d.count > 0 && (
                <span className="chart__value" style={{ bottom: `${(d.count / top) * 100}%` }} aria-hidden="true">
                  {d.count}
                </span>
              )}
              <div
                className={`chart__bar${d.count === 0 ? " chart__bar--zero" : ""}${i === lastIndex ? " chart__bar--today" : ""}`}
                style={{ height: d.count === 0 ? undefined : `${(d.count / top) * 100}%` }}
              />
            </div>
          ))}
        </div>

        {active !== null && (
          <div
            className={`chart__tip${active < 2 ? " chart__tip--start" : active > lastIndex - 2 ? " chart__tip--end" : ""}`}
            role="presentation"
            style={{ left: `${((active + 0.5) / days.length) * 100}%` }}
          >
            <span className="chart__tip-date">
              {active === lastIndex ? "Today" : pretty(days[active].date, { weekday: "short", day: "numeric", month: "short" })}
            </span>
            <strong>
              {days[active].count} {days[active].count === 1 ? "task" : "tasks"}
            </strong>
          </div>
        )}
      </div>

      {/* Day numbers under the bars */}
      <div className="chart__axis" aria-hidden="true">
        {days.map((d, i) => (
          <span key={d.date} className={i === lastIndex ? "chart__axis--today" : ""}>
            {i === lastIndex ? "Today" : pretty(d.date, { weekday: "short" })}
          </span>
        ))}
      </div>

      {/* Same data as a table, for screen readers */}
      <table className="sr-only">
        <caption>Tasks completed per day, last 7 days</caption>
        <thead>
          <tr><th>Day</th><th>Completed</th></tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{pretty(d.date, { weekday: "long", day: "numeric", month: "long" })}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
