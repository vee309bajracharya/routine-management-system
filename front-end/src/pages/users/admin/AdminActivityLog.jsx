/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Search,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../../services/api/axiosClient";
// import Loader from "../../../components/common/Loader";

const AdminActivityLog = () => {
  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch Activity Logs
  const fetchActivityLogs = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append("page", page);
      if (search) {
        params.append("search", search);
      }

      const response = await axiosClient.get(
        `/admin/activity-log/index?${params.toString()}`
      );

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
  };

  // Fetch Activity Log Details
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
    fetchActivityLogs(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  // Handle Clear Search
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Handle View Details
  const handleViewDetails = async (log) => {
    setIsDrawerOpen(true);
    await fetchActivityDetails(log.id);
  };

  // Handle Page Change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= paginationMeta.last_page) {
      setCurrentPage(page);
    }
  };

  // Get Event Badge Class
  const getEventBadgeClass = (event) => {
    switch (event.toLowerCase()) {
      case "created":
        return "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-500";
      case "deleted":
        return "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-500";
      case "updated":
        return "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-500";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-500";
    }
  };

  // Loading State
  if (loading && activityLogs.length === 0) {
    return (
      <div className="academic-common-bg min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-main-blue mb-2" />
      </div>
    );
  }

  // Error State
  if (error && activityLogs.length === 0) {
    return (
      <div className="academic-common-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchActivityLogs(currentPage, searchQuery)}
            className="dashboard-btn-link cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="academic-common-bg min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="form-header text-2xl font-bold">Activity Log</h1>
            <p className="form-subtext">
              Track and monitor all administrative actions and system changes.
            </p>
          </div>
          <button
            onClick={() => fetchActivityLogs(currentPage, searchQuery)}
            className="dashboard-btn-link cursor-pointer flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 flex-1 max-w-md"
        >
          <div className="relative w-full">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Event / Subject..."
              className="search-btn w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <button
            type="submit"
            className="dashboard-btn-link cursor-pointer whitespace-nowrap"
          >
            Search
          </button>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="w-full overflow-hidden bg-white dark:bg-dark-overlay rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 size={32} className="animate-spin text-main-blue mb-2" />
            </div>
          ) : (
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
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="table-tbody-tr hover:bg-gray-50/50 dark:hover:bg-dark-hover transition-colors"
                    >
                      <td className="p-4 font-semibold text-sm text-primary-text dark:text-white">
                        AL-{String(log.id).padStart(3, "0")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${getEventBadgeClass(
                            log.event
                          )}`}
                        >
                          {log.event}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-primary-text dark:text-white">
                        {log.subject_type}
                      </td>
                      <td className="p-4 text-sm text-primary-text dark:text-white">
                        {log.display_title}
                      </td>
                      <td className="p-4 text-sm text-primary-text dark:text-white">
                        {log.user}
                      </td>
                      <td className="p-4 text-[11px]">
                        <div className="font-bold text-primary-text dark:text-white">
                          {log.date}
                        </div>
                        <div className="text-sub-text">{log.time_ago}</div>
                      </td>
                      <td className="p-4">
                        <button
                          className="text-main-blue font-bold hover:underline flex items-center gap-1 text-xs"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-12 text-center text-sub-text"
                    >
                      {searchQuery
                        ? `No activity logs found for "${searchQuery}"`
                        : "No activity logs available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION UI */}
        {paginationMeta && paginationMeta.total > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-box-outline">
            <div className="text-sm text-sub-text">
              Showing <span className="font-semibold">{paginationMeta.from}</span> to{" "}
              <span className="font-semibold">{paginationMeta.to}</span> of{" "}
              <span className="font-semibold">{paginationMeta.total}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!paginationMeta.prev_page_url || loading}
                className="px-3 py-1.5 border border-box-outline rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from(
                  { length: Math.min(5, paginationMeta.last_page) },
                  (_, i) => {
                    let pageNum;
                    if (paginationMeta.last_page <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= paginationMeta.last_page - 2) {
                      pageNum = paginationMeta.last_page - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return pageNum;
                  }
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`px-3 py-1.5 border border-box-outline rounded-md transition-colors ${
                      pageNum === currentPage
                        ? "bg-main-blue text-white"
                        : "hover:bg-gray-100 dark:hover:bg-dark-hover"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!paginationMeta.next_page_url || loading}
                className="px-3 py-1.5 border border-box-outline rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DRAWER SECTION */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            className="fixed inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              className="drawer-background"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="p-6 border-b border-box-outline flex justify-between items-center bg-white dark:bg-dark-overlay sticky top-0 z-10">
                <h2 className="form-header text-xl">
                  View Activity Log Details
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="x-btn"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                {loadingDetails ? (
                  <div className="flex justify-center items-center p-12">
                   <Loader2 size={32} className="animate-spin text-main-blue mb-2" />
                  </div>
                ) : selectedLog ? (
                  <>
                    {/* Information Card */}
                    <div className="drawer-box-background p-6 rounded-xl space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-box-outline">
                        <span className="text-primary-text dark:text-white">
                          Activity ID
                        </span>
                        <span className="drawer-info-title text-xs font-semibold">
                          AL-{String(selectedLog.id).padStart(3, "0")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-box-outline/50">
                        <span className="text-primary-text dark:text-white">
                          Event Type
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getEventBadgeClass(
                            selectedLog.event
                          )}`}
                        >
                          {selectedLog.event}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-box-outline/50">
                        <span className="text-primary-text dark:text-white">
                          Subject
                        </span>
                        <span className="drawer-info-title text-xs font-semibold">
                          {selectedLog.subject}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-box-outline/50">
                        <span className="text-primary-text dark:text-white">
                          Performed By
                        </span>
                        <span className="drawer-info-title text-xs font-semibold">
                          {selectedLog.performer}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary-text dark:text-white">
                          Date & Time
                        </span>
                        <span className="drawer-info-title text-xs font-semibold">
                          {selectedLog.date}
                        </span>
                      </div>
                    </div>

                    {/* Changes Table if applicable */}
                    {selectedLog.changes && selectedLog.changes.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="drawer-info-header text-lg">
                          Changes Made
                        </h3>
                        <div className="rounded-xl border border-box-outline overflow-hidden">
                          <table className="w-full text-left text-sm">
                            <thead className="table-thead">
                              <tr>
                                <th className="table-th">Field</th>
                                <th className="table-th">Previous Value</th>
                                <th className="table-th">New Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-box-outline">
                              {selectedLog.changes.map((change, index) => (
                                <tr
                                  key={index}
                                  className="table-tbody-tr"
                                >
                                  <td className="p-4 font-semibold text-primary-text dark:text-white">
                                    {change.field}
                                  </td>
                                  <td className="p-4 text-red-600 dark:text-red-400">
                                    {change.old || "N/A"}
                                  </td>
                                  <td className="p-4 text-green-600 dark:text-green-400">
                                    {change.new || "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="drawer-info-header text-lg">
                          Changes Made
                        </h3>
                        <div className="p-6 text-center text-sub-text bg-gray-50 dark:bg-dark-hover rounded-xl">
                          No detailed changes available for this activity
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-sub-text p-12">
                    Failed to load activity details
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