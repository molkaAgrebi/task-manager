import { useId } from "react";

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Progress ring + the three counters, in one compact block.
export default function Stats({ total, done }) {
  const remaining = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const gradientId = useId();

  return (
    <section className="progress-card" aria-label="Progress">
      <div
        className="ring"
        role="progressbar"
        aria-label="Tasks completed"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <svg viewBox="0 0 60 60" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--brand-1)" />
              <stop offset="1" stopColor="var(--brand-2)" />
            </linearGradient>
          </defs>
          <circle className="ring__track" cx="30" cy="30" r={RADIUS} />
          <circle
            className="ring__fill"
            cx="30"
            cy="30"
            r={RADIUS}
            stroke={`url(#${gradientId})`}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
          />
        </svg>
        <span className="ring__value">{percent}%</span>
      </div>

      <dl className="mini-stats">
        <div>
          <dt>Total</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>Done</dt>
          <dd className="mini-stats__done">{done}</dd>
        </div>
        <div>
          <dt>To do</dt>
          <dd>{remaining}</dd>
        </div>
      </dl>
    </section>
  );
}
