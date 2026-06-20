import React from "react";

/**
 * LoadingSpinner — shown while data is being fetched
 */
export default function LoadingSpinner({ message = "Loading tasks..." }) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{message}</p>
    </div>
  );
}
