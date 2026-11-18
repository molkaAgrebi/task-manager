const request = require("supertest");
const app = require("../app");
const pool = require("../db");
const { createUser, cleanUp } = require("./helpers");

let alice; // { token }
let bob;

beforeAll(async () => {
  alice = await createUser(app);
  bob = await createUser(app);
});

afterAll(async () => {
  await cleanUp(pool);
  await pool.end();
});

// Small helper: request with Alice's or Bob's token
const as = (user) => ({
  get: (url) => request(app).get(url).set("Authorization", `Bearer ${user.token}`),
  post: (url) => request(app).post(url).set("Authorization", `Bearer ${user.token}`),
  put: (url) => request(app).put(url).set("Authorization", `Bearer ${user.token}`),
  delete: (url) => request(app).delete(url).set("Authorization", `Bearer ${user.token}`),
});

describe("Authentication", () => {
  test("refuses requests without a token", async () => {
    expect((await request(app).get("/tasks")).status).toBe(401);
  });

  test("refuses a fake token", async () => {
    const res = await request(app).get("/tasks").set("Authorization", "Bearer fake.token.here");
    expect(res.status).toBe(401);
  });
});

describe("Create and read", () => {
  test("creates a task with default values", async () => {
    const res = await as(alice).post("/tasks").send({ title: "  Buy bread  " });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Buy bread", done: false, priority: "medium", due_date: null });
  });

  test("creates a task with priority and due date", async () => {
    const res = await as(alice).post("/tasks").send({ title: "Pay rent", priority: "high", due_date: "2026-12-01" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ priority: "high", due_date: "2026-12-01" });
  });

  test.each([
    [{}, "missing title"],
    [{ title: "   " }, "empty title"],
    [{ title: "x".repeat(201) }, "title too long"],
    [{ title: "Ok", priority: "urgent" }, "unknown priority"],
    [{ title: "Ok", due_date: "2026-02-30" }, "date that does not exist"],
    [{ title: "Ok", due_date: "tomorrow" }, "date in the wrong format"],
  ])("refuses %o (%s)", async (body) => {
    expect((await as(alice).post("/tasks").send(body)).status).toBe(400);
  });

  test("a user only sees their own tasks", async () => {
    const aliceTasks = (await as(alice).get("/tasks")).body;
    const bobTasks = (await as(bob).get("/tasks")).body;
    expect(aliceTasks.length).toBe(2);
    expect(bobTasks.length).toBe(0);
  });
});

describe("Update", () => {
  let taskId;
  beforeAll(async () => {
    taskId = (await as(alice).post("/tasks").send({ title: "Write report", due_date: "2026-12-10" })).body.id;
  });

  test("updates several fields at once", async () => {
    const res = await as(alice).put(`/tasks/${taskId}`).send({ title: "Write final report", done: true, priority: "low" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: "Write final report", done: true, priority: "low", due_date: "2026-12-10" });
  });

  test("removes the due date with null", async () => {
    const res = await as(alice).put(`/tasks/${taskId}`).send({ due_date: null });
    expect(res.body.due_date).toBeNull();
  });

  test("refuses invalid values", async () => {
    expect((await as(alice).put(`/tasks/${taskId}`).send({ done: "yes" })).status).toBe(400);
    expect((await as(alice).put(`/tasks/${taskId}`).send({})).status).toBe(400);
    expect((await as(alice).put("/tasks/abc").send({ done: true })).status).toBe(400);
  });

  test("ignores unknown fields like user_id (cannot steal a task)", async () => {
    const res = await as(alice).put(`/tasks/${taskId}`).send({ user_id: 999999 });
    expect(res.status).toBe(400); // nothing valid to update
  });

  test("another user cannot update it", async () => {
    expect((await as(bob).put(`/tasks/${taskId}`).send({ done: false })).status).toBe(404);
  });
});

describe("Delete", () => {
  test("another user cannot delete it, the owner can", async () => {
    const id = (await as(alice).post("/tasks").send({ title: "Temporary" })).body.id;

    expect((await as(bob).delete(`/tasks/${id}`)).status).toBe(404);
    expect((await as(alice).delete(`/tasks/${id}`)).status).toBe(204);
    expect((await as(alice).delete(`/tasks/${id}`)).status).toBe(404);
  });
});

describe("SQL injection", () => {
  test("a malicious title is stored as plain text", async () => {
    const title = "x'); DROP TABLE tasks; --";
    const res = await as(alice).post("/tasks").send({ title });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(title);
    expect((await as(alice).get("/tasks")).status).toBe(200); // table still exists
  });
});
