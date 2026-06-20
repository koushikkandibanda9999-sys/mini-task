const request = require("supertest");
const path = require("path");
const fs = require("fs");

// Use a separate test DB file
const TEST_DB = path.join(__dirname, "test_db.json");
process.env.DB_PATH = TEST_DB;

const app = require("../server");

beforeEach(() => {
  // Reset test DB before each test
  fs.writeFileSync(TEST_DB, JSON.stringify({ tasks: [], users: [], nextTaskId: 1, nextUserId: 1 }));
  // Re-initialise lowdb from the reset file
  jest.resetModules();
});

afterAll(() => {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

describe("Auth API", () => {
  test("POST /auth/register — creates a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Alice",
      email: "alice@test.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("alice@test.com");
    expect(res.body.user.password).toBeUndefined(); // password must not be returned
  });

  test("POST /auth/register — rejects duplicate email", async () => {
    const payload = { name: "Bob", email: "bob@test.com", password: "pass123" };
    await request(app).post("/auth/register").send(payload);
    const res = await request(app).post("/auth/register").send(payload);
    expect(res.statusCode).toBe(409);
    expect(res.body.errors.email).toBeDefined();
  });

  test("POST /auth/register — validates required fields", async () => {
    const res = await request(app).post("/auth/register").send({ email: "x@x.com" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("POST /auth/login — returns token for valid credentials", async () => {
    await request(app).post("/auth/register").send({
      name: "Carol",
      email: "carol@test.com",
      password: "mypassword",
    });
    const res = await request(app).post("/auth/login").send({
      email: "carol@test.com",
      password: "mypassword",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("POST /auth/login — rejects wrong password", async () => {
    await request(app).post("/auth/register").send({
      name: "Dave",
      email: "dave@test.com",
      password: "rightpass",
    });
    const res = await request(app).post("/auth/login").send({
      email: "dave@test.com",
      password: "wrongpass",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("GET /auth/me — returns user for valid token", async () => {
    const reg = await request(app).post("/auth/register").send({
      name: "Eve",
      email: "eve@test.com",
      password: "pass123",
    });
    const token = reg.body.token;
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("eve@test.com");
  });

  test("GET /auth/me — rejects missing token", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.statusCode).toBe(401);
  });
});
