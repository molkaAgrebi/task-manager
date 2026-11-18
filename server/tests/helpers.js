const request = require("supertest");

// Every test email ends with this, so we can delete them all at the end.
const TEST_DOMAIN = "@tests.example.test";
const PASSWORD = "test-password-123";

function randomEmail() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2)}${TEST_DOMAIN}`;
}

// Registers + logs in a new user, returns their token.
async function createUser(app) {
  const email = randomEmail();
  await request(app).post("/auth/register").send({ email, password: PASSWORD }).expect(201);
  const res = await request(app).post("/auth/login").send({ email, password: PASSWORD }).expect(200);
  return { email, token: res.body.token };
}

// Removes the test users (their tasks go too, thanks to ON DELETE CASCADE).
async function cleanUp(pool) {
  await pool.query("DELETE FROM users WHERE email LIKE $1", [`%${TEST_DOMAIN}`]);
}

module.exports = { createUser, cleanUp, randomEmail, PASSWORD };
