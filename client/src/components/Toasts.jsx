import { useCallback, useRef, useState } from "react";

// Hook: gives a list of toasts and a notify() function to add one.
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  // type: "success" or "error"
  const notify = useCallback(
    (message, type = "success") => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, message, type }]); // max 3 on screen
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return { toasts, notify, dismiss };
}

// Display: aria-live makes screen readers announce new toasts.
export function Toasts({ toasts, dismiss }) {
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role={t.type === "error" ? "alert" : "status"}>
          <span className="toast__icon" aria-hidden="true">
            {t.type === "error" ? "!" : "✓"}
          </span>
          <p>{t.message}</p>
          <button
            type="button"
            className="toast__close"
            onClick={() => dismiss(t.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
