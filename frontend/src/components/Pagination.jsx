import React from "react";

/**
 * Pagination component with prev/next and page number buttons.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Build page range: always show first, last, current ±1
  function getPages() {
    const pages = new Set();
    pages.add(1);
    pages.add(totalPages);
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i >= 1 && i <= totalPages) pages.add(i);
    }
    return [...pages].sort((a, b) => a - b);
  }

  const pages = getPages();

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="page-btn page-btn-arrow"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && <span className="page-ellipsis">…</span>}
            <button
              className={`page-btn${currentPage === p ? " active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-current={currentPage === p ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      <button
        className="page-btn page-btn-arrow"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
