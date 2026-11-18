// Own file = own copy of the app, so this counter starts at zero.
process.env.LOGIN_RATE_LIMIT = "3";

const request = require("supertest");
const app = require("../app");
const pool = require("../db");

afterAll(() => pool.end());

test("blocks login after too many failed attempts", async () => {
  const attempt = () =>
    request(app).post("/auth/login").send({ email: "nobody@tests.example.test", password: "wrong-password" });

  for (let i = 0; i < 3; i++) {
    expect((await attempt()).status).toBe(401);
  }
  const blocked = await attempt();
  expect(blocked.status).toBe(429);
  expect(blocked.body.error).toMatch(/too many/i);
});
