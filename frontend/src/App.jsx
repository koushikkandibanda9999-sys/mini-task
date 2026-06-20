import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AddTask from "./pages/AddTask";
import Login from "./pages/Login";

function AppShell() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (loading) return null;

  return (
    <div className="app-wrapper">
      {isAuthenticated && (
        <nav className="navbar">
          <NavLink to="/" className="navbar-brand">
            <span className="brand-icon">📋</span>
            <span className="brand-text">TaskFlow</span>
          </NavLink>

          <div className="navbar-actions">
            <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end>
              Dashboard
            </NavLink>
            <NavLink to="/add" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Add Task
            </NavLink>

            <div className="user-menu">
              <span className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</span>
              <span className="user-name">{user?.name}</span>
            </div>

            <button className="theme-toggle" onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark mode" title={darkMode ? "Light mode" : "Dark mode"}>
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button className="btn btn-outline btn-sm logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </nav>
      )}

      <main className={isAuthenticated ? "main-content" : ""}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
