import { useCallback, useEffect, useRef, useState } from "react";
import Popover from "./Popover";
import { addDays, shortDateLabel, toDateString, todayString } from "../utils/tasks";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const QUICK = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next week", days: 7 },
];

// A styled date picker (replaces the browser's <input type="date">).
// value: "YYYY-MM-DD" or "" (no date). onChange(newValue).
export default function DatePicker({ value, onChange, align = "left" }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => firstOfMonth(value));
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  function openPicker() {
    setMonth(firstOfMonth(value)); // show the month of the chosen date (or this month)
    setOpen(true);
  }

  function choose(dateString) {
    onChange(dateString);
    close(true);
  }

  // Put the keyboard focus on the first quick choice.
  useEffect(() => {
    if (open) panelRef.current?.querySelector("button")?.focus();
  }, [open]);

  const today = todayString();
  const label = value ? shortDateLabel(value) : "Due date";

  return (
    <div
      className="menu-root"
      onKeyDown={(e) => {
        if (open && e.key === "Escape") {
          e.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`chip-btn${value ? " chip-btn--filled" : ""}${open ? " chip-btn--open" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={value ? `Due date: ${label}` : "Add a due date"}
        onClick={() => (open ? close() : openPicker())}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>{label}</span>
      </button>

      {open && (
        <Popover anchorRef={buttonRef} align={align} onClose={close}>
          <div ref={panelRef} className="datepicker" role="dialog" aria-label="Choose a due date">
            <div className="datepicker__quick">
              {QUICK.map((q) => {
                const date = addDays(q.days);
                return (
                  <button
                    key={q.label}
                    type="button"
                    className={`quick-btn${value === date ? " quick-btn--on" : ""}`}
                    onClick={() => choose(date)}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>

            <div className="datepicker__head">
              <button type="button" className="cal-nav" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <span className="datepicker__month" aria-live="polite">
                {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
              <button type="button" className="cal-nav" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            <div className="calendar">
              {WEEKDAYS.map((d) => (
                <span key={d} className="calendar__weekday" aria-hidden="true">{d}</span>
              ))}
              {monthCells(month).map((date, i) =>
                date ? (
                  <button
                    key={i}
                    type="button"
                    className={[
                      "calendar__day",
                      toDateString(date) === today ? "calendar__day--today" : "",
                      toDateString(date) === value ? "calendar__day--selected" : "",
                      toDateString(date) < today ? "calendar__day--past" : "",
                    ].join(" ")}
                    aria-label={date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    aria-pressed={toDateString(date) === value}
                    onClick={() => choose(toDateString(date))}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <span key={i} aria-hidden="true" />
                )
              )}
            </div>

            {value && (
              <button type="button" className="datepicker__clear" onClick={() => choose("")}>
                Remove date
              </button>
            )}
          </div>
        </Popover>
      )}
    </div>
  );
}

// ---- small calendar helpers ----

function firstOfMonth(dateString) {
  const base = dateString ? new Date(dateString + "T00:00:00") : new Date();
  return new Date(base.getFullYear(), base.getMonth(), 1);
}

function shiftMonth(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

// Always 42 cells (6 weeks, starting on Monday) so the panel never changes height.
// Empty cells are null.
function monthCells(month) {
  const offset = (month.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const day = i - offset + 1;
    cells.push(day >= 1 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : null);
  }
  return cells;
}
