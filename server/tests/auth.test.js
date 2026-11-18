const request = require("supertest");
const app = require("../app");
const pool = require("../db");
const { randomEmail, cleanUp, PASSWORD } = require("./helpers");

afterAll(async () => {
  await cleanUp(pool);
  await pool.end();
});

describe("POST /auth/register", () => {
  test("creates an account", async () => {
    const email = randomEmail();
    const res = await request(app).post("/auth/register").send({ email, password: PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty("password_hash");
  });

  test("refuses an invalid email", async () => {
    const res = await request(app).post("/auth/register").send({ email: "not-an-email", password: PASSWORD });
    expect(res.status).toBe(400);
  });

  test("refuses a short password", async () => {
    const res = await request(app).post("/auth/register").send({ email: randomEmail(), password: "short" });
    expect(res.status).toBe(400);
  });

  test("refuses an email already used", async () => {
    const email = randomEmail();
    await request(app).post("/auth/register").send({ email, password: PASSWORD }).expect(201);
    const res = await request(app).post("/auth/register").send({ email, password: PASSWORD });
    expect(res.status).toBe(409);
  });
});

describe("POST /auth/login", () => {
  test("returns a token with the right password", async () => {
    const email = randomEmail();
    await request(app).post("/auth/register").send({ email, password: PASSWORD });
    const res = await request(app).post("/auth/login").send({ email, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  test("gives the same error for a wrong password and an unknown email", async () => {
    const email = randomEmail();
    await request(app).post("/auth/register").send({ email, password: PASSWORD });

    const wrongPassword = await request(app).post("/auth/login").send({ email, password: "wrong-password" });
    const unknownEmail = await request(app).post("/auth/login").send({ email: randomEmail(), password: PASSWORD });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
  });
});

describe("Security headers and errors", () => {
  test("helmet hides Express and adds security headers", async () => {
    const res = await request(app).get("/");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("CORS only allows the front end origin", async () => {
    const allowed = await request(app).get("/").set("Origin", "http://localhost:5173");
    const other = await request(app).get("/").set("Origin", "https://evil.example");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(other.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("invalid JSON gives a clean 400", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid JSON");
  });
});
