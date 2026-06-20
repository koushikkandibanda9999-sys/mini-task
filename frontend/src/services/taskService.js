import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${API_BASE}/tasks`,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Fetch tasks with search, filter, sort and pagination.
 */
export async function fetchTasks({ status = "", search = "", sort = "desc", page = 1, limit = 6 } = {}) {
  const params = { sort, page, limit };
  if (status) params.status = status;
  if (search) params.search = search;
  const { data } = await api.get("/", { params });
  return data; // { tasks, total, page, totalPages }
}

/**
 * Fetch dashboard statistics.
 */
export async function fetchStats() {
  const { data } = await api.get("/stats");
  return data.data; // { total, pending, inProgress, completed }
}

/**
 * Create a new task.
 */
export async function createTask(taskData) {
  const { data } = await api.post("/", taskData);
  return data.data;
}

/**
 * Update a task's status.
 */
export async function updateTaskStatus(id, status) {
  const { data } = await api.put(`/${id}`, { status });
  return data.data;
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(id) {
  await api.delete(`/${id}`);
}
