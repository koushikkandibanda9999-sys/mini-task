import React from "react";
import { Link } from "react-router-dom";

/**
 * EmptyState — shown when no tasks match the current filter
 */
export default function EmptyState({ filter, search }) {
  const isFiltered = (filter && filter !== "All") || search;

  return (
    <div className="empty-state" role="region" aria-label="No tasks found">
      <span className="empty-state-icon">{isFiltered ? "🔍" : "📭"}</span>
      <h3 className="empty-state-title">
        {isFiltered ? `No "${filter}" tasks found` : "No tasks yet"}
      </h3>
      <p className="empty-state-text">
        {isFiltered
          ? "Try selecting a different filter."
          : "Get started by creating your first task."}
      </p>
      {!isFiltered && (
        <Link to="/add" className="btn btn-primary">
          + Add Task
        </Link>
      )}
    </div>
  );
}
