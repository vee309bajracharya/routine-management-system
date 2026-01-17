import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  ChevronDown,
  Box,
  RefreshCw,
  Loader2,
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
      (routine) => routine.status === activeTab
    );
  };

  // Get counts for filter buttons
  const getCounts = () => {
    if (!dashboardData?.routine_section) {
      return { draft: 0, published: 0, archived: 0 };
    }

    return {
      draft: dashboardData.routine_section.draft,
      published: dashboardData.routine_section.published,
      archived: dashboardData.routine_section.archived,
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
    <div className="flex min-h-screen academic-common-bg">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen">
        <div className="p-8 max-w-[1200px]">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="form-header">Admin Dashboard</h1>
              <p className="form-subtext">
                Welcome back, Admin! Today is {formatDate()}.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fetchDashboardData(currentPage)}
                className="dashboard-btn-link cursor-pointer flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <button
                onClick={() => navigate("/admin/schedule/routine")}
                className="dashboard-btn-link cursor-pointer"
              >
                Create Routine
              </button>
              <button
                onClick={() =>
                  navigate("/admin/academic-structure/user-accounts")
                }
                className="dashboard-btn-link cursor-pointer"
              >
                Add User
              </button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {/* Routine Cards */}
            <button
              onClick={() => navigate("/admin/schedule/overview")}
              className="dashboard-box cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-primary-text dark:text-white text-sm font-bold">
                  Total Routine
                </span>
                <Calendar
                  size={20}
                  className="text-primary-text dark:text-white"
                />
              </div>
              <h3 className="text-3xl dark:text-white my-4 text-left">
                {routineStats?.total || 0}
              </h3>
              <div className="flex w-full h-10 text-[10px] font-bold uppercase overflow-hidden rounded-xl mt-4">
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
              className="dashboard-box cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-primary-text dark:text-white text-sm font-bold">
                  Active Faculty
                </span>
                <Users
                  size={20}
                  className="text-primary-text dark:text-white"
                />
              </div>
              <h3 className="text-3xl dark:text-white my-4 text-left">
                {facultyStats?.active_faculty || 0}
              </h3>
              <div className="flex justify-between pt-2">
                <div className="text-left">
                  <p className="text-xs text-sub-text font-semibold">
                    Total Faculty Member
                  </p>
                  <p className="text-xl font-semibold text-primary-text dark:text-white">
                    {facultyStats?.total_faculty || 0}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-sub-text font-semibold">
                    Total Departments
                  </p>
                  <p className="text-xl font-semibold text-primary-text dark:text-white">
                    {facultyStats?.total_departments || 0}
                  </p>
                </div>
              </div>
            </button>

            {/* Rooms Cards */}
            <button
              onClick={() => navigate("/admin/rooms")}
              className="dashboard-box cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-primary-text dark:text-white text-sm font-bold">
                  Total Rooms
                </span>
                <Box size={20} className="text-primary-text dark:text-white" />
              </div>
              <h3 className="text-3xl dark:text-white my-4 text-left">
                {roomStats?.total_rooms || 0}
              </h3>
              <div className="flex justify-between items-end">
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-sub-text font-semibold">
                      Classroom
                    </p>
                    <p className="text-xl font-semibold text-primary-text dark:text-white">
                      {roomStats?.room_type?.Classroom || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-sub-text font-semibold">Lab</p>
                    <p className="text-xl font-semibold text-primary-text dark:text-white">
                      {roomStats?.room_type?.Lab || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-sub-text font-semibold">
                      Lecture Hall
                    </p>
                    <p className="text-xl font-semibold text-primary-text dark:text-white">
                      {roomStats?.room_type?.["Lecture Hall"] || 0}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Routine Table Section */}
          <div>
            <h2 className="form-header">Routine Overview</h2>
            <p className="form-subtext mb-6">
              View a quick summary of routines. Click a routine name to see full
              details.
            </p>

            <div className="bg-white dark:bg-dark-overlay rounded-xl shadow-sm overflow-hidden">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 p-4 border-b border-box-outline flex-wrap">
                {["draft", "published", "archived"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`filter-btn transition-all ${
                      activeTab === status
                        ? "bg-main-blue text-white shadow-sm"
                        : "bg-gray-100 text-primary-text hover:bg-gray-200 dark:bg-dark-hover dark:text-white"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span
                      className={`ml-1 opacity-70 font-normal ${
                        activeTab === status ? "text-blue-100" : ""
                      }`}
                    >
                      {counts[status]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Data Table */}
              <div className="w-full overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center p-12">
                    <Loader2
                      size={32}
                      className="animate-spin text-main-blue mb-2"
                    />
                    <p className="text-sub-text text-sm">Loading...</p>{" "}
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="table-thead">
                      <tr className="text-left text-primary-text dark:text-white">
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
                      {filteredRoutines.length > 0 ? (
                        filteredRoutines.map((routine) => (
                          <tr key={routine.id} className="table-tbody-tr">
                            <td className="p-4 font-semibold text-primary-text dark:text-white opacity-70">
                              ROUT-{String(routine.id).padStart(5, "0")}
                            </td>
                            <td
                              className="p-4 text-main-blue font-semibold cursor-pointer hover:underline"
                              onClick={() =>
                                navigate(
                                  `/admin/schedule/routine/${routine.id}`
                                )
                              }
                            >
                              {routine.title}
                            </td>
                            <td className="p-4 text-primary-text dark:text-white">
                              {routine.description || "-"}
                            </td>
                            <td className="p-4 text-primary-text dark:text-white">
                              {routine.semester?.name || "-"}
                            </td>
                            <td className="p-4 text-primary-text dark:text-white">
                              {routine.batch?.name || "-"}
                            </td>
                            <td className="p-4 text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs uppercase ${
                                  routine.status === "published"
                                    ? "table-active"
                                    : routine.status === "draft"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500"
                                    : "table-inactive"
                                }`}
                              >
                                {routine.status}
                              </span>
                            </td>
                            <td className="p-4 text-primary-text dark:text-white">
                              {routine.generated_by?.name || "System"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-12 text-center text-sub-text"
                          >
                            No {activeTab} routines available to display.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {paginationMeta && paginationMeta.last_page > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-box-outline">
                  <p className="text-sm text-sub-text">
                    Showing {paginationMeta.from} to {paginationMeta.to} of{" "}
                    {paginationMeta.total} routines
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!paginationMeta.prev || loading}
                      className="px-3 py-1 rounded border border-box-outline disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-hover"
                    >
                      Previous
                    </button>
                    {Array.from(
                      { length: paginationMeta.last_page },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                        className={`px-3 py-1 rounded border border-box-outline ${
                          page === currentPage
                            ? "bg-main-blue text-white"
                            : "hover:bg-gray-100 dark:hover:bg-dark-hover"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!paginationMeta.next || loading}
                      className="px-3 py-1 rounded border border-box-outline disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-hover"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Sidebar */}
      <div className="w-[350px] bg-white border-l border-gray-200 dark:bg-dark-overlay h-screen sticky top-0 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-1">
          <h2 className="form-header">Recent Activity</h2>
          <div className="relative">
            <button 
            onClick={()=>navigate("/admin/activitylog")}
            className="dropdown-select flex items-center gap-1 hover:!bg-gray-100">
              All 
            </button>
          </div>
        </div>
        <p className="form-subtext mb-6">View what's been done recently.</p>

        <div className="relative space-y-8">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-4 relative z-10 text-left"
              >
                <div
                  className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                    activity.display_text.includes("created")
                      ? "bg-green-400"
                      : activity.display_text.includes("deleted")
                      ? "bg-red-400"
                      : "bg-amber-400"
                  } ring-4 ring-white dark:ring-dark-overlay`}
                ></div>
                <div>
                  <h4 className="text-[14px] font-bold text-primary-text leading-tight dark:text-white">
                    {activity.display_text}
                  </h4>
                  <p className="text-xs text-sub-text mt-1 font-medium">
                    {activity.causer_name} - {activity.created_at}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sub-text">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
