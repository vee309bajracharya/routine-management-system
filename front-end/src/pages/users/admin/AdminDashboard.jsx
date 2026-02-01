import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  ChevronDown,
  Box,
  RefreshCw,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import axiosClient from "../../../services/api/axiosClient";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("draft");
  const [currentPage, setCurrentPage] = useState(1);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Fetch Dashboard Data
  const fetchDashboardData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(`/admin/dashboard?page=${page}`);

      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.userMessage || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(currentPage);
  }, [currentPage]);

  // Filter routines by status
  const getFilteredRoutines = () => {
    if (!dashboardData?.routine_table?.data) return [];

    return dashboardData.routine_table.data.filter(
      (routine) => routine.status === activeTab,
    );
  };

  // Get counts for filter buttons
  const getCounts = () => {
    if (!dashboardData?.routine_section) {
      return { draft: 0, published: 0, archieved: 0 };
    }

    return {
      draft: dashboardData.routine_section.draft,
      published: dashboardData.routine_section.published,
      archieved: dashboardData.routine_section.archived,
    };
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Format date for display
  const formatDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  // Loading State
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen academic-common-bg">
        <Loader2 size={32} className="animate-spin text-main-blue mb-2" />
      </div>
    );
  }

  // Error State
  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen academic-common-bg">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData(currentPage)}
            className="dashboard-btn-link cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredRoutines = getFilteredRoutines();
  const counts = getCounts();
  const routineStats = dashboardData?.routine_section;
  const facultyStats = dashboardData?.faculty_section;
  const roomStats = dashboardData?.room_section;
  const activities = dashboardData?.activities || [];
  const paginationMeta = dashboardData?.routine_table?.meta;

  return (
    <section className="flex flex-col lg:flex-row min-h-screen academic-common-bg font-general-sans">
      {/* Main Content Area */}
      <section className="flex-1 lg:overflow-y-auto w-full lg:h-screen">
        <div className="max-w-[1200px] mx-auto p-2 mr-3">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start lg:items-end mb-6 sm:mb-8 gap-4">
            <div className="flex-1">
              <h1 className="sm:text-2xl lg:text-3xl font-semibold dark:text-white">Admin Dashboard</h1>
              <p className="form-subtext text-xs sm:text-sm mt-1">
                Welcome back, Admin! Today is {formatDate()}.
              </p>
            </div>

            {/* MENU BUTTON - Mobile/Tablet Only */}
            <button
              onClick={() => setIsActivityOpen(true)}
              className="lg:hidden fixed top-4 right-4 z-30 p-2 bg-white dark:bg-dark-overlay rounded-lg shadow-md border border-box-outline"
            >
              <Menu size={20} className="text-primary-text dark:text-white" />
            </button>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
              <button
                onClick={() => navigate("/admin/schedule/routine")}
                className="dashboard-btn-link cursor-pointer px-3 py-2 text-xs sm:text-sm rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Create Routine
              </button>
              <button
                onClick={() =>
                  navigate("/admin/academic-structure/user-accounts")
                }
                className="dashboard-btn-link cursor-pointer px-3 py-2 text-xs sm:text-sm rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Add User
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 sm:mb-10">
            {/* Routine Cards */}
            <button
              onClick={() => navigate("/admin/schedule/overview")}
              className="dashboard-box cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <span className="dashboard-box-title text-xs sm:text-sm">Total Routine</span>
                <Calendar
                  size={18}
                  className="text-primary-text dark:text-white"
                />
              </div>
              <h3 className="dashboard-stat-value text-2xl sm:text-3xl">
                {routineStats?.total || 0}
              </h3>
              <div className="flex w-full h-10 text-[12px] font-semibold overflow-hidden rounded-md mt-4">
                <div className="bg-yellow-200 text-yellow-800 flex-1 flex flex-col items-center justify-center min-w-0">
                  <span>Draft</span>
                  <span>{routineStats?.draft || 0}</span>
                </div>
                <div className="bg-green-200 text-green-800 flex-1 flex flex-col items-center justify-center min-w-0 border-x border-white/20">
                  <span>Published</span>
                  <span>{routineStats?.published || 0}</span>
                </div>
                <div className="bg-purple-200 text-purple-800 flex-1 flex flex-col items-center justify-center min-w-0">
                  <span>Archived</span>
                  <span>{routineStats?.archived || 0}</span>
                </div>
              </div>
            </button>

            {/* Faculty Cards */}
            <button
              onClick={() => navigate("/admin/faculty")}
              className="dashboard-box cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <span className="dashboard-box-title text-xs sm:text-sm">Active Faculty</span>
                <Users
                  size={18}
                  className="text-primary-text dark:text-white"
                />
              </div>
              <h3 className="dashboard-stat-value text-2xl sm:text-3xl">
                {facultyStats?.active_faculty || 0}
              </h3>
              <div className="flex justify-between pt-2">
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-sub-text font-semibold">
                    Total Faculty Member
                  </p>
                  <p className="dashboard-box-subtext text-base sm:text-xl">
                    {facultyStats?.total_faculty || 0}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-sub-text font-semibold">
                    Total Departments
                  </p>
                  <p className="dashboard-box-subtext text-base sm:text-xl">
                    {facultyStats?.total_departments || 0}
                  </p>
                </div>
              </div>
            </button>

            {/* Rooms Cards */}
            <button
              onClick={() => navigate("/admin/rooms")}
              className="dashboard-box cursor-pointer transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1"
            >
              <div className="flex justify-between items-start">
                <span className="dashboard-box-title text-xs sm:text-sm">Total Rooms</span>
                <Box size={18} className="text-primary-text dark:text-white" />
              </div>
              <h3 className="dashboard-stat-value text-2xl sm:text-3xl">
                {roomStats?.total_rooms || 0}
              </h3>
              <div className="flex justify-between items-end">
                <div className="flex gap-3 sm:gap-4 text-center">
                  <div>
                    <p className="text-[10px] sm:text-xs text-sub-text font-semibold">
                      Classroom
                    </p>
                    <p className="dashboard-box-subtext text-base sm:text-xl">
                      {roomStats?.room_type?.Classroom || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-sub-text font-semibold">Lab</p>
                    <p className="dashboard-box-subtext text-base sm:text-xl">
                      {roomStats?.room_type?.Lab || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-sub-text font-semibold">
                      Lecture Hall
                    </p>
                    <p className="dashboard-box-subtext text-base sm:text-xl">
                      {roomStats?.room_type?.["Lecture Hall"] || 0}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Routine Table Section */}
          <div>
            <h2 className="form-header text-xl sm:text-2xl">Routine Overview</h2>
            <p className="form-subtext text-xs sm:text-sm mb-4 sm:mb-6">
              View a quick summary of latest created routines.
            </p>

            <div className="bg-white dark:bg-dark-overlay rounded-lg border border-box-outline overflow-hidden">

              <section className="flex justify-between">
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 p-3 sm:p-4 flex-wrap">
                  {["draft", "published", "archieved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setActiveTab(status)}
                      className={`filter-btn transition-all px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${activeTab === status
                        ? "bg-main-blue text-white shadow-sm"
                        : "bg-main-gray text-primary-text hover:bg-gray-200 dark:bg-dark-hover dark:text-white"
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      <span
                        className={`ml-1 opacity-70 font-normal ${activeTab === status ? "text-blue-100" : ""
                          }`}
                      >
                        {counts[status]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-3">
                  <button
                    onClick={() => fetchDashboardData(currentPage)}
                    className="dashboard-btn-link cursor-pointer flex items-center gap-2 px-3 py-2 text-xs sm:text-sm rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={loading}
                  >
                    <RefreshCw
                      size={14}
                      className={loading ? "animate-spin" : ""}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>

              </section>

              {/* TABLE */}
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
                  <p className="text-sub-text text-sm">Loading routines...</p>
                </div>
              ) : filteredRoutines.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-main-gray dark:bg-dark-hover">
                  <p className="text-sub-text text-base">No {activeTab} routines available to display.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-3 p-3">
                    {filteredRoutines.map((routine) => (
                      <div key={routine.id} className="bg-main-gray dark:bg-dark-hover border border-box-outline rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-primary-text dark:text-white">
                            ROUT-{String(routine.id).padStart(3, "0")}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs uppercase font-semibold ${routine.status === "published"
                              ? "table-active"
                              : routine.status === "draft"
                                ? "bg-warning-faidorange text-warning-orange dark:bg-yellow-900 dark:text-yellow-500"
                                : "bg-purple-100 text-information-purple dark:bg-purple-900 dark:text-purple-500"
                              }`}
                          >
                            {routine.status}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-sub-text">Routine Name:</span>
                            <span className="text-main-blue font-medium">{routine.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sub-text">Description:</span>
                            <span className="text-primary-text dark:text-white">{routine.description || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sub-text">Semester:</span>
                            <span className="text-primary-text dark:text-white">{routine.semester?.name || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sub-text">Batch:</span>
                            <span className="text-primary-text dark:text-white">{routine.batch?.name || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sub-text">Generated By:</span>
                            <span className="text-primary-text dark:text-white">{routine.generated_by?.name || "System"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="table-thead">
                        <tr>
                          <th className="table-th">Routine ID</th>
                          <th className="table-th">Routine Name</th>
                          <th className="table-th">Description</th>
                          <th className="table-th">Semester</th>
                          <th className="table-th">Batch</th>
                          <th className="table-th text-center">Status</th>
                          <th className="table-th">Generated By</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-box-outline">
                        {filteredRoutines.map((routine) => (
                          <tr key={routine.id} className="table-tbody-tr">
                            <td className="p-4">ROUT-{String(routine.id).padStart(5, "0")}</td>
                            <td className="p-4 text-main-blue font-medium">{routine.title}</td>
                            <td className="p-4">{routine.description || "-"}</td>
                            <td className="p-4">{routine.semester?.name || "-"}</td>
                            <td className="p-4">{routine.batch?.name || "-"}</td>
                            <td className="p-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-xs uppercase font-semibold ${routine.status === "published"
                                  ? "table-active"
                                  : routine.status === "draft"
                                    ? "bg-warning-faidorange text-warning-orange dark:bg-yellow-900 dark:text-yellow-500"
                                    : "bg-purple-100 text-information-purple dark:bg-purple-900 dark:text-purple-500"
                                  }`}
                              >
                                {routine.status}
                              </span>
                            </td>
                            <td className="p-4">{routine.generated_by?.name || "System"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Pagination */}
              {paginationMeta && paginationMeta.last_page > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 sm:px-4 py-4 mt-4 border-t border-box-outline">
                  <div className="text-xs sm:text-sm text-primary-text dark:text-white text-center sm:text-left">
                    Showing{" "}
                    <span className="font-semibold">{paginationMeta.from}</span>{" "}
                    to{" "}
                    <span className="font-semibold">{paginationMeta.to}</span>{" "}
                    of{" "}
                    <span className="font-semibold">{paginationMeta.total}</span>{" "}
                    routines
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!paginationMeta.prev || loading}
                      className="px-2 sm:px-3 py-1.5 border border-box-outline rounded-md dark:text-white cursor-pointer hover:bg-main-gray dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1 sm:gap-2 max-w-[200px] sm:max-w-none overflow-x-auto">
                      {Array.from(
                        { length: paginationMeta.last_page },
                        (_, i) => i + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm cursor-pointer transition-colors ${page === currentPage
                            ? "bg-main-blue text-white"
                            : "border border-box-outline hover:bg-main-gray dark:text-white dark:hover:bg-dark-hover"
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!paginationMeta.next || loading}
                      className="px-2 sm:px-3 py-1.5 border border-box-outline rounded-md dark:text-white cursor-pointer hover:bg-main-gray dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* OVERLAY for Mobile/Tablet */}
      {isActivityOpen && (
        <div
          onClick={() => setIsActivityOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* RECENT ACTIVITY SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 right-0 z-50 w-[280px] sm:w-[320px] lg:w-[350px] bg-white dark:bg-dark-overlay border-l border-box-outline h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 transform transition-transform duration-300 ease-in-out
          ${isActivityOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="form-header text-lg sm:text-xl">Recent Activity</h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/activitylog")}
              className="hidden lg:flex dropdown-select items-center gap-1 hover:!bg-hover-gray dark:hover:!bg-dark-overlay px-2 py-1 rounded-md text-xs cursor-pointer"
            >
              All
            </button>

            {/* Close button for Mobile/Tablet */}
            <button
              onClick={() => setIsActivityOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-black dark:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <p className="form-subtext text-xs sm:text-sm mb-6 sm:mb-8">View what's been done recently.</p>

        <div className="relative space-y-6 sm:space-y-8">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 sm:gap-4 relative group">
                <div
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-1.5 shrink-0 ring-4 ring-white dark:ring-dark-overlay 
                  ${activity.display_text.includes("created")
                      ? "bg-success-green"
                      : activity.display_text.includes("deleted")
                        ? "bg-error-red"
                        : "bg-warning-orange"
                    }`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-primary-text dark:text-white leading-tight">
                    {activity.display_text}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-sub-text mt-1 font-medium">
                    {activity.causer_name} • {activity.created_at}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sub-text text-xs sm:text-sm py-8 sm:py-10">
              No recent activities
            </p>
          )}
        </div>
      </aside>
    </section>
  );
};

export default AdminDashboard;