// Small helpers around localStorage.
// try/catch because localStorage can be blocked (private mode, strict settings).
export function load(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function save(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Not saved: the app still works, the value just won't survive a reload.
  }
}
