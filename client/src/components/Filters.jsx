const OPTIONS = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "done", label: "Done" },
];

// Segmented buttons. aria-pressed tells screen readers which one is active.
export default function Filters({ value, onChange, counts }) {
  return (
    <div className="filters" role="group" aria-label="Filter tasks">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="filters__btn"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          <span className="filters__count">{counts[option.value]}</span>
        </button>
      ))}
    </div>
  );
}
