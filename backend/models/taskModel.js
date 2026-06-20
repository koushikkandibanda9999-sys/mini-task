const pool = require("../config/database");

/**
 * Get paginated, filtered, searched, sorted tasks for a user.
 */
async function getTasksByUser(userId, options = {}) {
  const {
    status = "",
    search = "",
    sortOrder = "desc",
    page = 1,
    limit = 6,
  } = options;

  const offset = (page - 1) * limit;
  const order  = sortOrder === "asc" ? "ASC" : "DESC";
  const params = [userId];
  let where    = "userId = ?";

  if (status) {
    where += " AND status = ?";
    params.push(status);
  }
  if (search.trim()) {
    where += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  // Total count
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM tasks WHERE ${where}`,
    params
  );
  const total      = countRows[0].total;
  const totalPages = Math.ceil(total / limit) || 1;
  const safePage   = Math.min(Math.max(1, page), totalPages);
  const safeOffset = (safePage - 1) * limit;

  // Paginated results
  const [tasks] = await pool.execute(
    `SELECT * FROM tasks WHERE ${where} ORDER BY created_at ${order} LIMIT ${limit} OFFSET ${safeOffset}`,
    params
  );

  return { tasks, total, page: safePage, totalPages };
}

/**
 * Get dashboard stats for a user.
 */
async function getTaskStats(userId) {
  const [rows] = await pool.execute(
    `SELECT
      COUNT(*) AS total,
      SUM(status = 'Pending') AS pending,
      SUM(status = 'In Progress') AS inProgress,
      SUM(status = 'Completed') AS completed
    FROM tasks WHERE userId = ?`,
    [userId]
  );
  const r = rows[0];
  return {
    total:      Number(r.total),
    pending:    Number(r.pending),
    inProgress: Number(r.inProgress),
    completed:  Number(r.completed),
  };
}

/**
 * Get a single task by id (and verify ownership).
 */
async function getTaskById(id, userId) {
  const [rows] = await pool.execute(
    "SELECT * FROM tasks WHERE id = ? AND userId = ? LIMIT 1",
    [id, userId]
  );
  return rows[0] || null;
}

/**
 * Create a new task.
 */
async function createTask(userId, title, description, status) {
  const [result] = await pool.execute(
    "INSERT INTO tasks (userId, title, description, status) VALUES (?, ?, ?, ?)",
    [userId, title, description, status]
  );
  return getTaskById(result.insertId, userId);
}

/**
 * Update task status (owner only).
 */
async function updateTaskStatus(id, userId, status) {
  const [result] = await pool.execute(
    "UPDATE tasks SET status = ? WHERE id = ? AND userId = ?",
    [status, id, userId]
  );
  if (result.affectedRows === 0) return null;
  return getTaskById(id, userId);
}

/**
 * Delete a task (owner only).
 */
async function deleteTask(id, userId) {
  const [result] = await pool.execute(
    "DELETE FROM tasks WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getTasksByUser,
  getTaskStats,
  getTaskById,
  createTask,
  updateTaskStatus,
  deleteTask,
};
