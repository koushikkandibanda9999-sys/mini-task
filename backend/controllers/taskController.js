const {
  getTasksByUser,
  getTaskStats,
  createTask,
  updateTaskStatus,
  deleteTask,
} = require("../models/taskModel");

const VALID_STATUSES = ["Pending", "In Progress", "Completed"];

/**
 * GET /tasks
 */
async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const { status = "", search = "", sort = "desc", page = "1", limit = "6" } = req.query;

    if (status && !VALID_STATUSES.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status filter" });

    const result = await getTasksByUser(userId, {
      status,
      search,
      sortOrder: sort === "asc" ? "asc" : "desc",
      page:  parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
}

/**
 * GET /tasks/stats
 */
async function getStats(req, res) {
  try {
    const stats = await getTaskStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
}

/**
 * POST /tasks
 */
async function addTask(req, res) {
  try {
    const userId = req.user.id;
    const { title, description, status } = req.body;
    const errors = {};

    if (!title || title.trim() === "")
      errors.title = "Title is required";
    else if (title.trim().length > 100)
      errors.title = "Title must be 100 characters or fewer";

    if (!description || description.trim().length < 20)
      errors.description = "Description must be at least 20 characters";

    if (status && !["Pending", "In Progress"].includes(status))
      errors.status = "Status must be 'Pending' or 'In Progress'";

    if (Object.keys(errors).length > 0)
      return res.status(400).json({ success: false, errors });

    const task = await createTask(userId, title.trim(), description.trim(), status || "Pending");
    res.status(201).json({ success: true, data: task, message: "Task created successfully" });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
}

/**
 * PUT /tasks/:id
 */
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status)
      return res.status(400).json({ success: false, message: "Status is required" });
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });

    const task = await updateTaskStatus(Number(id), req.user.id, status);
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });

    res.json({ success: true, data: task, message: "Task updated successfully" });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
}

/**
 * DELETE /tasks/:id
 */
async function removeTask(req, res) {
  try {
    const { id } = req.params;
    const deleted = await deleteTask(Number(id), req.user.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Task not found" });

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
}

module.exports = { getTasks, getStats, addTask, updateTask, removeTask };
