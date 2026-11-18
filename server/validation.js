// Small input checks, shared by the routes.
// Each function returns an error message (string) or null if the value is OK.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRIORITIES = ["low", "medium", "high"];
const TITLE_MAX = 200;

function checkEmail(email) {
  if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
    return "A valid email is required";
  }
  return null;
}

function checkPassword(password) {
  // bcrypt only uses the first 72 bytes, so longer passwords are refused.
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    return "Password must be between 8 and 72 characters";
  }
  return null;
}

function checkTitle(title) {
  if (typeof title !== "string" || title.trim() === "") return "Title is required";
  if (title.trim().length > TITLE_MAX) return `Title must be ${TITLE_MAX} characters or less`;
  return null;
}

function checkPriority(priority) {
  if (!PRIORITIES.includes(priority)) return "Priority must be low, medium or high";
  return null;
}

// due_date: null (no date) or a real calendar date written "YYYY-MM-DD"
function checkDueDate(dueDate) {
  if (dueDate === null) return null;
  if (typeof dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return "Due date must be YYYY-MM-DD or null";
  }
  const date = new Date(dueDate + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dueDate) {
    return "Due date is not a real date";
  }
  return null;
}

module.exports = { checkEmail, checkPassword, checkTitle, checkPriority, checkDueDate };
