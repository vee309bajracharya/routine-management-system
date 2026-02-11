/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../../services/api/axiosClient";

const AdminActivityLog = () => {
  // DEBOUNCE HOOK
  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
  };

  // STATE MANAGEMENT
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 450);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // FETCHING LOGIC
  const fetchActivityLogs = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        ...(search.trim() && { search: search.trim() }),
      };

      const response = await axiosClient.get("/admin/activity-log/index", {
        params,
      });

      if (response.data.success) {
        setActivityLogs(response.data.data.data);
        setPaginationMeta({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          from: response.data.data.from,
          to: response.data.data.to,
          total: response.data.data.total,
          per_page: response.data.data.per_page,
          prev_page_url: response.data.data.prev_page_url,
          next_page_url: response.data.data.next_page_url,
        });
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(err.userMessage || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivityDetails = async (id) => {
    try {
      setLoadingDetails(true);
      const response = await axiosClient.get(`/admin/activity-log/show/${id}`);
      if (response.data.success) {
        setSelectedLog(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching activity details:", err);
      setError(err.userMessage || "Failed to load activity details");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchActivityLogs]);

  // HANDLERS
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleViewDetails = async (log) => {
    setIsDrawerOpen(true);
    await fetchActivityDetails(log.id);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= paginationMeta.last_page) {
      setCurrentPage(page);
    }
  };

  const getEventBadgeClass = (event) => {
    switch (event.toLowerCase()) {
      case "created":
        return "create";
      case "deleted":
        return "delete";
      case "updated":
        return "update";
      default:
        return "default";
    }
  };

  if (loading && activityLogs.length === 0) {
    return (
      <div className="academic-common-bg flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-main-blue mb-2" />
      </div>
    );
  }

  return (
    <div className="academic-common-bg">
      {/* HEADER SECTION */}
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="form-header">Activity Log</h1>
            <p className="form-subtext">
              Track and monitor all administrative actions and system changes.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3 flex-1 w-full sm:max-w-md">
          <div className="relative w-full">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              id="search"
              placeholder="Event / Subject"
              className="search-btn"
              value={searchTerm}
              onChange={handleSearchChange}
              autoComplete="off"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text hover:text-primary-text dark:hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      {loading && activityLogs.length === 0 ? (
        <div className="state-container">
          <Loader2 size={32} className="animate-spin text-main-blue mb-2" />
        </div>
      ) : activityLogs.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">
            {debouncedSearch
              ? `No activity logs found for "${debouncedSearch}"`
              : "No activity logs available"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th">Activity Log ID</th>
                    <th className="table-th">Event</th>
                    <th className="table-th">Subject</th>
                    <th className="table-th">Activity Title</th>
                    <th className="table-th">User</th>
                    <th className="table-th">Timestamp</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-box-outline">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="table-tbody-tr">
                      <td className="p-4">
                        AL-{String(log.id).padStart(3, "0")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${getEventBadgeClass(log.event)}`}
                        >
                          {log.event}
                        </span>
                      </td>
                      <td className="p-4">{log.subject_type}</td>
                      <td className="p-4">{log.display_title}</td>
                      <td className="p-4">{log.user}</td>
                      <td className="p-4 text-xs">
                        <div className="font-semibold">{log.date}</div>
                        <div className="text-sub-text">{log.time_ago}</div>
                      </td>
                      <td className="p-4">
                        <button
                          className="text-main-blue font-semibold flex items-center gap-1 text-xs cursor-pointer"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-card-list">
            {activityLogs.map((log) => (
              <div key={log.id} className="mobile-card-container">
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-sub-text">
                        AL-{String(log.id).padStart(3, "0")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getEventBadgeClass(log.event)}`}
                      >
                        {log.event}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-primary-text dark:text-white">
                      {log.display_title}
                    </h3>
                    <p className="text-sm text-sub-text mt-1">
                      {log.subject_type}
                    </p>
                  </div>
                </div>

                {/* Activity Info */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="info-label">User:</span>
                    <span className="info-value text-right">{log.user}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="info-label">Date:</span>
                    <span className="text-sm text-primary-text dark:text-white font-medium">
                      {log.date}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="info-label">Time:</span>
                    <span className="text-sm text-sub-text">
                      {log.time_ago}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-main-blue text-main-blue rounded-md hover:bg-main-blue hover:text-white transition-colors"
                    onClick={() => handleViewDetails(log)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {paginationMeta && paginationMeta.total > 0 && (
            <div className="pagination-container flex-col sm:flex-row gap-4">
              <div className="pagination-text text-center sm:text-left">
                Showing{" "}
                <span className="font-semibold">{paginationMeta.from}</span> to{" "}
                <span className="font-semibold">{paginationMeta.to}</span> of{" "}
                <span className="font-semibold">{paginationMeta.total}</span>{" "}
                results
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationMeta.prev_page_url || loading}
                  className="pagination-prev-btn"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(5, paginationMeta.last_page) },
                    (_, i) => {
                      let pageNum;
                      if (paginationMeta.last_page <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= paginationMeta.last_page - 2)
                        pageNum = paginationMeta.last_page - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return pageNum;
                    },
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 rounded-md text-sm ${
                        pageNum === currentPage
                          ? "bg-main-blue text-white"
                          : "border dark:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationMeta.next_page_url || loading}
                  className="pagination-prev-btn"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* DRAWER SECTION */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            className="fixed inset-0 z-50 font-general-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="drawer-container"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Sticky Header */}
              <div className="drawer-sticky-header">
                <div className="flex justify-between items-center">
                  <h2 className="drawer-title">View Activity Log Details</h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="x-btn"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-[700px]">
                {loadingDetails ? (
                  <div className="state-container">
                    <Loader2
                      size={40}
                      className="animate-spin text-main-blue mb-3"
                    />
                    <p className="state-loading">Loading details...</p>
                  </div>
                ) : selectedLog ? (
                  <>
                    {/* Top Info Box */}
                    <div className="drawer-box-background">
                      {/* Activity */}
                      <div className="drawer-items-seprator mb-3">
                        <p className="drawer-row-label">Activity ID</p>
                        <p className="text-primary-text dark:text-white text-sm sm:text-base">
                          AL-{String(selectedLog.id).padStart(3, "0")}
                        </p>
                      </div>

                      {/* Event Type */}
                      <div className="drawer-items-seprator mb-3">
                        <p className="drawer-row-label">Event Type</p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getEventBadgeClass(selectedLog.event)}`}
                        >
                          {selectedLog.event}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className="drawer-items-seprator mb-3">
                        <p className="drawer-row-label">Subject</p>
                        <p className="drawer-row-value">
                          {selectedLog.subject}
                        </p>
                      </div>

                      {/* Performed */}
                      <div className="drawer-items-seprator mb-3">
                        <p className="drawer-row-label">Performed By</p>
                        <p className="drawer-row-value">
                          {selectedLog.performer}
                        </p>
                      </div>

                      {/* Date & Time */}
                      <div className="flex justify-between items-center">
                        <p className="drawer-row-label">Date & Time</p>
                        <p className="drawer-row-value">{selectedLog.date}</p>
                      </div>
                    </div>

                    {/* Changes Made Section */}
                    <div className="space-y-4">
                      <h4 className="drawer-section-title">Changes Made</h4>
                      {selectedLog.changes && selectedLog.changes.length > 0 ? (
                        <>
                          {/* Desktop Table View */}
                          <div className="hidden sm:block overflow-x-auto rounded-lg border border-box-outline">
                            <table className="min-w-full">
                              <thead className="table-thead">
                                <tr>
                                  <th className="drawer-table-th">Field</th>
                                  <th className="drawer-table-th">
                                    Previous Value
                                  </th>
                                  <th className="drawer-table-th">New Value</th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-box-outline">
                                {selectedLog.changes.map((change, index) => (
                                  <tr key={index} className="table-tbody-tr">
                                    <td className="p-3 md:p-4 text-xs md:text-sm text-primary-text dark:text-white">
                                      {change.field}
                                    </td>
                                    <td className="p-3 md:p-4 text-xs md:text-sm text-error-red font-medium">
                                      {change.old || "N/A"}
                                    </td>
                                    <td className="p-3 md:p-4 text-xs md:text-sm text-success-green font-medium">
                                      {change.new || "N/A"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Card View */}
                          <div className="block sm:hidden space-y-3">
                            {selectedLog.changes.map((change, index) => (
                              <div
                                key={index}
                                className="bg-hover-gray dark:bg-dark-hover p-3 rounded-lg border border-box-outline space-y-2"
                              >
                                <div className="flex justify-between items-center pb-2 border-b border-box-outline">
                                  <span className="text-xs font-semibold text-sub-text uppercase">
                                    Field
                                  </span>
                                  <span className="text-sm font-bold text-primary-text dark:text-white">
                                    {change.field}
                                  </span>
                                </div>
                                <div className="mobile-data-row">
                                  <span className="text-xs text-sub-text">
                                    Previous:
                                  </span>
                                  <span className="text-sm text-error-red font-medium text-right">
                                    {change.old || "N/A"}
                                  </span>
                                </div>
                                <div className="mobile-data-row">
                                  <span className="text-xs text-sub-text">
                                    New:
                                  </span>
                                  <span className="text-sm text-success-green font-medium text-right">
                                    {change.new || "N/A"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="p-6 sm:p-10 text-center text-sub-text bg-hover-gray dark:bg-dark-hover rounded-2xl border border-dashed border-box-outline">
                          <p className="text-sm sm:text-base">
                            No detailed changes available
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state-wrapper">
                    <p className="text-sub-text text-sm sm:text-base">
                      Activity data not found
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminActivityLog;
