import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "✅", text: "Create & manage tasks" },
  { icon: "🔍", text: "Search & filter instantly" },
  { icon: "📊", text: "Dashboard statistics" },
  { icon: "🌙", text: "Dark mode support" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setApiError("");
  }

  function switchMode(m) {
    setMode(m);
    setErrors({});
    setApiError("");
    setForm({ name: "", email: "", password: "" });
  }

  function validate() {
    const e = {};
    if (mode === "register" && (!form.name || form.name.trim().length < 2))
      e.name = "Name must be at least 2 characters";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }

    setSubmitting(true);
    try {
      const res = mode === "login"
        ? await loginUser(form.email, form.password)
        : await registerUser(form.name, form.email, form.password);
      login(res.token, res.user);
      navigate("/");
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
      } else {
        const msg = err.response?.data?.message || "Something went wrong. Please try again.";
        setApiError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-panel">
        <div className="auth-panel-content">
          <span className="auth-panel-logo">📋</span>
          <h1 className="auth-panel-title">TaskFlow</h1>
          <p className="auth-panel-desc">
            Your personal project management portal. Stay organized, track progress, and get things done.
          </p>
          <div className="auth-panel-features">
            {FEATURES.map((f) => (
              <div key={f.text} className="auth-feature-item">
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-icon">📋</span>
            <span className="auth-logo-text">TaskFlow</span>
          </div>

          <h2 className="auth-title">
            {mode === "login" ? "Welcome back 👋" : "Create account"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Sign in to access your dashboard"
              : "Start organizing your tasks for free"}
          </p>

          {apiError && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="name" name="name" type="text"
                  className={`form-control${errors.name ? " error" : ""}`}
                  placeholder="e.g. John Doe"
                  value={form.name} onChange={handleChange}
                  autoComplete="name" autoFocus
                />
                {errors.name && <p className="form-error">⚠ {errors.name}</p>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                id="email" name="email" type="email"
                className={`form-control${errors.email ? " error" : ""}`}
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                autoComplete="email"
                autoFocus={mode === "login"}
              />
              {errors.email && <p className="form-error">⚠ {errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password" name="password"
                  type={showPass ? "text" : "password"}
                  className={`form-control${errors.password ? " error" : ""}`}
                  placeholder={mode === "register" ? "Min. 6 characters" : "Your password"}
                  value={form.password} onChange={handleChange}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  style={{ paddingRight: "3rem" }}
                />
                <button type="button"
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute", right: "0.75rem", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", fontSize: "1rem",
                    color: "var(--text-3)", lineHeight: 1,
                  }}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="form-error">⚠ {errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              {submitting
                ? <><span className="btn-spinner" />{mode === "login" ? "Signing in…" : "Creating account…"}</>
                : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p className="auth-switch">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button className="auth-link" onClick={() => switchMode("register")}>Sign up free</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button className="auth-link" onClick={() => switchMode("login")}>Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
