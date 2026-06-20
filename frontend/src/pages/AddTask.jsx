import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTask } from "../services/taskService";

const INITIAL = { title: "", description: "", status: "Pending" };
const DESC_MIN = 20;

export default function AddTask() {
  const navigate = useNavigate();
  const [form, setForm]           = useState(INITIAL);
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [apiError, setApiError]   = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim())              e.title = "Title is required";
    else if (form.title.trim().length > 100) e.title = "Max 100 characters";
    if (!form.description.trim())        e.description = "Description is required";
    else if (form.description.trim().length < DESC_MIN)
      e.description = `At least ${DESC_MIN} characters required`;
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(""); setSuccessMsg("");
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setSubmitting(true);
    try {
      await createTask({ title: form.title.trim(), description: form.description.trim(), status: form.status });
      setSuccessMsg("Task created! Redirecting…");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      const se = err.response?.data?.errors;
      if (se) setErrors(se);
      else setApiError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  }

  const descLen   = form.description.length;
  const descValid = descLen >= DESC_MIN;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add New Task</h1>
          <p className="page-subtitle">Fill in the details to create a task</p>
        </div>
        <Link to="/" className="btn btn-outline">← Back</Link>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {apiError  && <div className="alert alert-error">⚠️ {apiError}</div>}
        {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Task Title <span className="required">*</span>
          </label>
          <input id="title" name="title" type="text"
            className={`form-control${errors.title ? " error" : ""}`}
            placeholder="e.g. Design the homepage layout"
            value={form.title} onChange={handleChange}
            maxLength={100} autoFocus
          />
          {errors.title && <p className="form-error">⚠ {errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description <span className="required">*</span>
          </label>
          <textarea id="description" name="description"
            className={`form-control${errors.description ? " error" : ""}`}
            placeholder="Describe this task in detail…"
            value={form.description} onChange={handleChange}
            rows={4}
          />
          <p className={`char-count${descLen === 0 ? "" : descValid ? " valid" : " invalid"}`}>
            {descLen} / {DESC_MIN} min characters
          </p>
          {errors.description && <p className="form-error">⚠ {errors.description}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="status" className="form-label">Initial Status</label>
          <select id="status" name="status"
            className="form-control"
            value={form.status} onChange={handleChange}
          >
            <option value="Pending">⏳ Pending</option>
            <option value="In Progress">🔄 In Progress</option>
          </select>
          <p className="form-hint">Mark as Completed from the Dashboard.</p>
        </div>

        <div className="form-actions">
          <Link to="/" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <><span className="btn-spinner" /> Creating…</> : "＋ Create Task"}
          </button>
        </div>
      </form>
    </>
  );
}
