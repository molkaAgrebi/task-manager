import { useCallback, useEffect, useId, useRef, useState } from "react";
import Popover from "./Popover";

// A styled drop-down list (replaces the browser's <select>).
// Keyboard: Enter/Space/↓ opens, ↑ ↓ move, Enter chooses, Escape closes.
//   options: [{ value, label }]
//   prefix: optional text before the value (e.g. "Sort:")
//   dots: show a colored dot per option (used for priorities)
export default function Menu({ label, value, options, onChange, prefix, icon, dots = false, align = "left" }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const id = useId();

  const current = options.find((o) => o.value === value) || options[0];

  function openMenu() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  function choose(option) {
    onChange(option.value);
    close(true);
  }

  // Move the keyboard focus into the list when it opens.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  function handleListKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Tab") {
      close();
    }
  }

  return (
    <div
      className="menu-root"
      onKeyDown={(e) => {
        // Escape closes only the menu (not the edit form around it).
        if (open && e.key === "Escape") {
          e.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`chip-btn${open ? " chip-btn--open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (!open && e.key === "ArrowDown") {
            e.preventDefault();
            openMenu();
          }
        }}
      >
        {icon}
        {dots && <span className={`dot dot--${current.value}`} aria-hidden="true" />}
        {prefix && <span className="chip-btn__prefix">{prefix}</span>}
        <span>{current.label}</span>
        <svg className="chip-btn__chevron" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <Popover anchorRef={buttonRef} align={align} onClose={close}>
          <ul
            ref={listRef}
            className="menu"
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${id}-${active}`}
            onKeyDown={handleListKeyDown}
          >
            {options.map((option, i) => (
              <li
                key={option.value}
                id={`${id}-${i}`}
                role="option"
                aria-selected={option.value === value}
                className={`menu__item${i === active ? " menu__item--active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(option)}
              >
                {dots && <span className={`dot dot--${option.value}`} aria-hidden="true" />}
                <span className="menu__label">{option.label}</span>
                {option.value === value && (
                  <svg className="menu__check" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </Popover>
      )}
    </div>
  );
}
