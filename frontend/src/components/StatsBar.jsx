import React from "react";

/**
 * StatsBar — animated statistics cards showing task counts
 */
export default function StatsBar({ stats, loading }) {
  const items = [
    { key: "total",      label: "Total Tasks",     icon: "📋", cls: "stat-total",      val: stats?.total },
    { key: "pending",    label: "Pending",          icon: "⏳", cls: "stat-pending",    val: stats?.pending },
    { key: "inProgress", label: "In Progress",      icon: "🔄", cls: "stat-inprogress", val: stats?.inProgress },
    { key: "completed",  label: "Completed",        icon: "✅", cls: "stat-completed",  val: stats?.completed },
  ];

  return (
    <div className="stats-row" role="region" aria-label="Task statistics">
      {items.map(({ key, label, icon, cls, val }) => (
        <div key={key} className={`stat-card ${cls}`}>
          <div className="stat-icon">{icon}</div>
          <div className={`stat-value${loading ? " stat-skeleton" : ""}`}>
            {loading ? "—" : val ?? 0}
          </div>
          <div className="stat-label">{label}</div>
          {!loading && val > 0 && (
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${Math.min(100, (val / (stats?.total || 1)) * 100)}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
