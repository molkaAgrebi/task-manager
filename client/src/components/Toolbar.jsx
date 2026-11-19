import { SORTS } from "../utils/tasks";
import Menu from "./Menu";

// Search box + sort menu.
export default function Toolbar({ search, onSearch, sort, onSort }) {
  return (
    <div className="toolbar">
      <div className="search">
        <label htmlFor="search" className="sr-only">Search tasks</label>
        <svg className="search__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id="search"
          type="search"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      <Menu
        label="Sort tasks"
        value={sort}
        options={SORTS}
        onChange={onSort}
        align="right"
        icon={
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
      />
    </div>
  );
}
