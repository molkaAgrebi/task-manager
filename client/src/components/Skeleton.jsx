// Grey placeholder cards shown while tasks are loading.
export default function Skeleton() {
  return (
    <div>
      <p className="sr-only">Loading tasks…</p>
      <ul className="task-list" aria-hidden="true">
        {[70, 50, 60].map((width, i) => (
          <li key={i} className="task glass skeleton">
            <span className="skeleton__box" />
            <span className="skeleton__line" style={{ width: `${width}%` }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
