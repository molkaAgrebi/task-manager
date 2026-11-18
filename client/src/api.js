// All calls to the Express API live in this file.
// The address can be changed with VITE_API_URL (useful later with Docker).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        // The token proves who we are. The server reads it in middleware/auth.js.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the API running?");
  }

  // 204 = success with no content (used by DELETE)
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.error || "Something went wrong");
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: { email, password } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  getTasks: (token) => request("/tasks", { token }),
  // task: { title, priority, due_date }
  addTask: (token, task) =>
    request("/tasks", { method: "POST", token, body: task }),
  updateTask: (token, id, changes) =>
    request(`/tasks/${id}`, { method: "PUT", token, body: changes }),
  deleteTask: (token, id) =>
    request(`/tasks/${id}`, { method: "DELETE", token }),
};
