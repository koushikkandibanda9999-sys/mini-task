import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

const authApi = axios.create({
  baseURL: `${API_BASE}/auth`,
  headers: { "Content-Type": "application/json" },
});

export async function registerUser(name, email, password) {
  const { data } = await authApi.post("/register", { name, email, password });
  return data;
}

export async function loginUser(email, password) {
  const { data } = await authApi.post("/login", { email, password });
  return data;
}

export async function getMe(token) {
  const { data } = await authApi.get("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
