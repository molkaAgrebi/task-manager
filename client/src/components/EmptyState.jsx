const MESSAGES = {
  all: { title: "No tasks yet", text: "Add your first task above and start your day." },
  todo: { title: "Nothing left to do", text: "Every task is done. Time for a coffee." },
  done: { title: "No finished tasks yet", text: "Check a task when it's done and it will show up here." },
};

export default function EmptyState({ filter, search, onClearSearch }) {
  const { title, text } = search
    ? { title: "No matching tasks", text: `Nothing matches "${search}".` }
    : MESSAGES[filter];
  return (
    <div className="empty">
      {/* Simple illustration: a clipboard with a sparkle */}
      <svg className="empty__art" viewBox="0 0 160 140" aria-hidden="true">
        <defs>
          <linearGradient id="empty-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <ellipse cx="80" cy="128" rx="46" ry="6" className="empty__shadow" />
        <rect x="44" y="22" width="72" height="96" rx="12" className="empty__board" />
        <rect x="62" y="14" width="36" height="16" rx="6" fill="url(#empty-gradient)" />
        <rect x="58" y="50" width="12" height="12" rx="3" className="empty__line" />
        <rect x="76" y="53" width="28" height="6" rx="3" className="empty__line" />
        <rect x="58" y="72" width="12" height="12" rx="3" className="empty__line" />
        <rect x="76" y="75" width="22" height="6" rx="3" className="empty__line" />
        <rect x="58" y="94" width="12" height="12" rx="3" className="empty__line" />
        <rect x="76" y="97" width="26" height="6" rx="3" className="empty__line" />
        <path
          className="empty__sparkle"
          d="M128 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"
          fill="url(#empty-gradient)"
        />
      </svg>
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      {search && (
        <button type="button" className="btn btn--ghost empty__action" onClick={onClearSearch}>
          Clear search
        </button>
      )}
    </div>
  );
}
