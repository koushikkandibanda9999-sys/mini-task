const request = require("supertest");
const path = require("path");
const fs = require("fs");

const TEST_DB = path.join(__dirname, "test_tasks_db.json");
process.env.DB_PATH = TEST_DB;

const app = require("../server");

let token;

async function getToken() {
  await request(app).post("/auth/register").send({
    name: "Tester",
    email: "tester@test.com",
    password: "testpass123",
  });
  const res = await request(app).post("/auth/login").send({
    email: "tester@test.com",
    password: "testpass123",
  });
  return res.body.token;
}

beforeAll(async () => {
  fs.writeFileSync(TEST_DB, JSON.stringify({ tasks: [], users: [], nextTaskId: 1, nextUserId: 1 }));
  token = await getToken();
});

afterAll(() => {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

describe("Tasks API", () => {
  let taskId;

  test("POST /tasks — creates a task", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "This is a test task with enough description length",
        status: "Pending",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Test Task");
    taskId = res.body.data.id;
  });

  test("POST /tasks — rejects short description", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Bad", description: "Too short", status: "Pending" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.description).toBeDefined();
  });

  test("POST /tasks — rejects missing title", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "A longer description for testing purposes here" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.title).toBeDefined();
  });

  test("GET /tasks — returns task list with pagination", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  test("GET /tasks — search filter works", async () => {
    const res = await request(app)
      .get("/tasks?search=Test Task")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /tasks/stats — returns correct counts", async () => {
    const res = await request(app)
      .get("/tasks/stats")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data).toHaveProperty("pending");
    expect(res.body.data).toHaveProperty("inProgress");
    expect(res.body.data).toHaveProperty("completed");
  });

  test("PUT /tasks/:id — updates task status to Completed", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Completed" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("Completed");
  });

  test("PUT /tasks/:id — rejects invalid status", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Flying" });
    expect(res.statusCode).toBe(400);
  });

  test("DELETE /tasks/:id — deletes the task", async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /tasks/:id — returns 404 for nonexistent task", async () => {
    const res = await request(app)
      .delete("/tasks/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  test("GET /tasks — returns 401 without token", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(401);
  });
});
