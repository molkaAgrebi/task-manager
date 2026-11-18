// Three counters + a progress bar.
export default function Stats({ total, done }) {
  const remaining = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="stats glass" aria-label="Progress">
      <dl className="stats__grid">
        <div>
          <dt>Total</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>Done</dt>
          <dd className="stats__done">{done}</dd>
        </div>
        <div>
          <dt>To do</dt>
          <dd>{remaining}</dd>
        </div>
      </dl>

      <div className="progress">
        <div className="progress__label">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <div
          className="progress__track"
          role="progressbar"
          aria-label="Tasks completed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="progress__fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </section>
  );
}
