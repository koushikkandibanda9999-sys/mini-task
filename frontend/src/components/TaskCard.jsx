import React, { useState } from "react";

function getStatusClass(status) {
  switch (status) {
    case "Pending":     return "badge-pending";
    case "In Progress": return "badge-inprogress";
    case "Completed":   return "badge-completed";
    default:            return "badge-pending";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Pending":     return "⏳";
    case "In Progress": return "🔄";
    case "Completed":   return "✅";
    default:            return "⏳";
  }
}

function getCardClass(status) {
  switch (status) {
    case "Pending":     return "status-pending";
    case "In Progress": return "status-inprogress";
    case "Completed":   return "status-completed";
    default:            return "status-pending";
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function TaskCard({ task, onComplete, onDelete }) {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingDelete, setLoadingDelete]   = useState(false);
  const isCompleted = task.status === "Completed";

  async function handleComplete() {
    setLoadingComplete(true);
    await onComplete(task.id);
    setLoadingComplete(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?\nThis cannot be undone.`)) return;
    setLoadingDelete(true);
    await onDelete(task.id);
    setLoadingDelete(false);
  }

  return (
    <div className={`task-card ${getCardClass(task.status)}`}>
      <div className="task-card-header">
        <h3 className={`task-title${isCompleted ? " completed" : ""}`}>
          {task.title}
        </h3>
        <span className={`badge ${getStatusClass(task.status)}`}>
          {getStatusIcon(task.status)} {task.status}
        </span>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-meta">
        <span className="task-date">📅 {formatDate(task.created_at)}</span>
        <div className="task-actions">
          {!isCompleted && (
            <button
              className="btn btn-success btn-sm"
              onClick={handleComplete}
              disabled={loadingComplete || loadingDelete}
              aria-label="Mark as completed"
            >
              {loadingComplete ? "…" : "✓ Done"}
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={loadingComplete || loadingDelete}
            aria-label="Delete task"
          >
            {loadingDelete ? "…" : "🗑"}
          </button>
        </div>
      </div>
    </div>
  );
}
