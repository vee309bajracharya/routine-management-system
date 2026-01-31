import { ChevronLeft, ChevronRight } from "lucide-react";

const FacultyPagination = ({ pagination, loadPage }) => {
  if (!pagination || pagination.last_page <= 1) return null;

  const { current_page, last_page, total, per_page } = pagination;
  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7; // Maximum page buttons to show

    if (last_page <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1); // Always show first page
      
      if (current_page > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, current_page - 1);
      const end = Math.min(last_page - 1, current_page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current_page < last_page - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(last_page);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container flex-col sm:flex-row gap-3 sm:gap-4">
      {/* Results Info */}
      <div className="pagination-text text-xs sm:text-sm text-center sm:text-left">
        Showing 
        <span className="font-semibold"> {from}</span> to{" "}
        <span className="font-semibold">{to}</span> of{" "}
        <span className="font-semibold">{total}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        {/* Previous Button */}
        <button
          onClick={() => loadPage(current_page - 1)}
          disabled={current_page === 1}
          className="pagination-prev-btn"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 text-primary-text dark:text-white">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-sub-text text-sm">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => loadPage(page)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  page === current_page
                    ? "bg-main-blue text-white shadow-sm"
                    : "border border-box-outline hover:bg-hover-gray dark:hover:bg-dark-hover"
                }`}
                aria-label={`Page ${page}`}
                aria-current={page === current_page ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => loadPage(current_page + 1)}
          disabled={current_page === last_page}
          className="pagination-prev-btn"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default FacultyPagination;