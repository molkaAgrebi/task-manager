import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A floating panel placed under (or above) a button.
// It is rendered at the end of <body> ("portal") so no card or blur effect can hide it.
//   anchorRef: the button it belongs to
//   align: "left" or "right" edge of the button
//   onClose(): called when the user clicks somewhere else
export default function Popover({ anchorRef, align = "left", onClose, className = "", children }) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  // Compute the position before the browser paints (no jump).
  useLayoutEffect(() => {
    function place() {
      const anchor = anchorRef.current?.getBoundingClientRect();
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const gap = 8;
      const margin = 12; // keep away from the screen edges
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;

      let left = align === "right" ? anchor.right - width : anchor.left;
      left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

      // Below the button, or above it if there is no room below.
      let top = anchor.bottom + gap;
      if (top + height > window.innerHeight - margin && anchor.top - gap - height > margin) {
        top = anchor.top - gap - height;
      }
      setPosition({ top, left });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef, align]);

  // Close when clicking outside the panel and its button.
  useEffect(() => {
    function handlePointerDown(e) {
      if (panelRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return;
      onClose();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [anchorRef, onClose]);

  return createPortal(
    <div ref={panelRef} className={`popover ${className}`} style={position}>
      {children}
    </div>,
    document.body
  );
}
