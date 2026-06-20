import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import TaskCard from "../components/TaskCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import StatsBar from "../components/StatsBar";
import { fetchTasks, fetchStats, updateTaskStatus, deleteTask } from "../services/taskService";

const FILTERS = ["All", "Pending", "In Progress", "Completed"];
const ITEMS_PER_PAGE = 6;

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const debounceRef = useRef(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await fetchStats();
      setStats(s);
    } catch {
      // Stats are non-critical, fail silently
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadTasks = useCallback(async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchTasks({
        status: opts.status ?? (activeFilter === "All" ? "" : activeFilter),
        search: opts.search ?? search,
        sort: opts.sort ?? sort,
        page: opts.page ?? page,
        limit: ITEMS_PER_PAGE,
      });
      setTasks(result.tasks);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch {
      setError("Failed to load tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, search, sort, page]);

  // Initial load
  useEffect(() => {
    loadTasks();
    loadStats();
  }, []);

  // Reload when filter / sort / page changes
  useEffect(() => {
    loadTasks({ status: activeFilter === "All" ? "" : activeFilter, page: 1 });
    setPage(1);
  }, [activeFilter, sort]);

  // Debounced search
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
      loadTasks({ search: val, status: activeFilter === "All" ? "" : activeFilter, page: 1 });
    }, 350);
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    loadTasks({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleComplete(id) {
    try {
      await updateTaskStatus(id, "Completed");
      await loadTasks({ page });
      await loadStats();
    } catch {
      alert("Failed to update task.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(id);
      // If last item on page > 1, go back
      const newPage = tasks.length === 1 && page > 1 ? page - 1 : page;
      await loadTasks({ page: newPage });
      await loadStats();
    } catch {
      alert("Failed to delete task.");
    }
  }

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Manage and track your project tasks</p>
        </div>
        <Link to="/add" className="btn btn-primary">＋ Add Task</Link>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} loading={statsLoading} />

      {error && (
        <div className="alert alert-error" role="alert">
          ⚠️ {error}
          <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
            onClick={() => { loadTasks(); loadStats(); }}>Retry</button>
        </div>
      )}

      {/* Toolbar: search + sort + filters */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            className="search-input"
            placeholder="Search tasks…"
            value={searchInput}
            onChange={handleSearchChange}
            aria-label="Search tasks"
          />
          {searchInput && (
            <button className="search-clear" onClick={() => {
              setSearchInput(""); setSearch(""); setPage(1);
              loadTasks({ search: "", status: activeFilter === "All" ? "" : activeFilter, page: 1 });
            }} aria-label="Clear search">✕</button>
          )}
        </div>

        <div className="sort-box">
          <label htmlFor="sort-select" className="sort-label">Sort:</label>
          <select id="sort-select" className="sort-select form-control"
            value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-bar" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button key={f}
            className={`filter-btn${activeFilter === f ? " active" : ""}`}
            onClick={() => setActiveFilter(f)}
            aria-pressed={activeFilter === f}>
            {f}
          </button>
        ))}
      </div>

      {/* Result count */}
      {!loading && !error && (
        <p className="result-count">
          {total === 0 ? "No tasks found" : `Showing ${tasks.length} of ${total} task${total !== 1 ? "s" : ""}`}
          {search && <span className="search-term"> for "<strong>{search}</strong>"</span>}
        </p>
      )}

      {/* Task list */}
      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState filter={activeFilter} search={search} />
      ) : (
        <div className="tasks-grid" role="list">
          {tasks.map((task) => (
            <div key={task.id} role="listitem">
              <TaskCard task={task} onComplete={handleComplete} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </>
  );
}
