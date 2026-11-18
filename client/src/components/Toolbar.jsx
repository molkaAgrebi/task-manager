import { SORTS } from "../utils/tasks";

// Search box + sort menu.
export default function Toolbar({ search, onSearch, sort, onSort }) {
  return (
    <div className="toolbar">
      <div className="search">
        <label htmlFor="search" className="sr-only">Search tasks</label>
        <svg className="search__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id="search"
          type="search"
          placeholder="Search tasks"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      <label className="mini-field sort">
        <span>Sort</span>
        <select value={sort} onChange={(e) => onSort(e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
