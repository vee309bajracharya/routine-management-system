/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Clock,
  FlaskConical,
  Box,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosClient from "../../../services/api/axiosClient";
import { toast } from "react-toastify";

const TeacherDashboard = () => {
  // Debounce hook
  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
  };

  /* STATE */
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [selectedDay, setSelectedDay] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);

  /* FETCH DASHBOARD DATA */
  const fetchDashboardData = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        ...filters,
      };

      const response = await axiosClient.get("/teacher/dashboard", { params });

      if (response.data.success) {
        // Update today's classes
        setTodaysClasses(response.data.data || []);

        // Update schedule table
        setSchedule(response.data.schedule || []);

        // Update pagination
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error(error.userMessage || "Failed to load dashboard data");
      setTodaysClasses([]);
      setSchedule([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch with filters
  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      day: selectedDay || null,
    };
    fetchDashboardData(currentPage, filters);
  }, [currentPage, debouncedSearch, selectedDay, fetchDashboardData]);

  /* FILTER HANDLERS */
  const handleFilterChange = (filterKey, value) => {
    setCurrentPage(1); // Reset to page 1 when filters change
    if (filterKey === "search") setSearchTerm(value);
    else if (filterKey === "day") setSelectedDay(value);
  };

  const handleClearFilters = () => {
    setSelectedDay("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  /* PAGINATION */
  const loadPage = (page) => setCurrentPage(page);

  /* STATUS BADGE STYLING */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Ongoing":
        return "bg-primary5-blue text-main-blue";
      case "Upcoming":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Completed":
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* UI */
  return (
    <div className="pt-10 px-30 min-h-screen">
      {/* HEADER */}
      <h1 className="form-header mb-3">Dashboard</h1>

      {/* TODAY'S CLASSES SECTION */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={18} className="text-main-blue" />
          <h2 className="text-lg font-semibold dark:text-white">
            Today's Classes
          </h2>
        </div>

        {isLoading && todaysClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] bg-white dark:bg-dark-overlay rounded-lg">
            <Loader2 size={32} className="animate-spin text-main-blue mb-2" />
            <p className="text-sub-text text-sm">Loading classes...</p>
          </div>
        ) : todaysClasses.length === 0 ? (
          <div className="bg-white dark:bg-dark-overlay rounded-lg shadow-sm p-8 text-center">
            <CalendarDays size={40} className="mx-auto text-sub-text mb-3" />
            <p className="text-sub-text">No classes scheduled for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaysClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex border dark:border-box-outline rounded-lg bg-white dark:bg-dark-overlay shadow-sm"
              >
                {cls.status === "Ongoing" && (
                  <div className="w-1.5 bg-main-blue rounded-l-lg"></div>
                )}

                <div className="p-4 flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(
                        cls.status
                      )}`}
                    >
                      {cls.status}
                    </span>
                    <span className="text-xs text-sub-text capitalize">
                      {cls.batch?.shift || "N/A"} Session
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-1 dark:text-white">
                    {cls.course?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 dark:text-white">
                    {cls.batch?.name || "N/A"}
                  </p>

                  <div className="flex items-center justify-between gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{cls.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {cls.room?.type === "Lab" ? (
                        <FlaskConical size={14} />
                      ) : (
                        <Box size={14} />
                      )}
                      <span>{cls.room?.number || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MY TEACHING SCHEDULE SECTION */}
      <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-dark-overlay">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          My Teaching Schedule
        </h2>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => handleFilterChange("day", "")}
            className={`filter-btn ${
              selectedDay === ""
                ? "bg-main-blue text-white hover:bg-hover-blue"
                : "bg-gray-100 text-primary-text dark:hover:text-black hover:bg-gray-200 dark:bg-dark-hover dark:text-white"
            }`}
          >
            All Days
          </button>
          <div className="">
            <select
              value={selectedDay}
              onChange={(e) => handleFilterChange("day", e.target.value)}
              className="dropdown-select"
            >
              <option value="">Select Day</option>
              <option value="Sunday">Sunday</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Course / Batch"
              className="search-btn w-full pl-10"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          {(selectedDay || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="filter-btn bg-gray-100 text-primary-text dark:hover:text-black hover:bg-gray-200 dark:bg-dark-hover dark:text-white"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* TABLE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
            <p className="text-sub-text text-sm">Loading schedule...</p>
          </div>
        ) : schedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 dark:bg-dark-hover rounded-lg">
            <p className="text-sub-text text-base">No classes found</p>
            {(selectedDay || searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="mt-3 text-sm text-main-blue hover:underline"
              >
                Clear filters to see all classes
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="table-thead">
                  <tr>
                    <th className="table-th">Days</th>
                    <th className="table-th">Shift</th>
                    <th className="table-th">Batch</th>
                    <th className="table-th">Course</th>
                    <th className="table-th">Time</th>
                    <th className="table-th">Room</th>
                    <th className="table-th">Type</th>
                  </tr>
                </thead>

                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.id} className="table-tbody-tr">
                      <td className="p-2 font-medium">{row.day}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            row.shift === "Morning"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}
                        >
                          {row.shift}
                        </span>
                      </td>
                      <td className="p-2 text-main-blue font-semibold">
                        {row.batch}
                      </td>
                      <td className="p-2 text-main-blue font-semibold">
                        {row.course}
                      </td>
                      <td className="p-2">{row.time}</td>
                      <td className="p-2">{row.room}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            row.room_type === "Lab"
                              ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {row.room_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pagination && pagination.total > 10 && (
              <div className="flex items-center justify-between px-4 py-4 mt-4 border-t border-box-outline">
                <div className="text-sm text-primary-text dark:text-white">
                  Showing{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * 10 + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * 10, pagination.total)}
                  </span>{" "}
                  of <span className="font-semibold">{pagination.total}</span>{" "}
                  results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-box-outline rounded-md dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.ceil(pagination.total / 10) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => loadPage(page)}
                      className={`px-3 py-1.5 rounded-md text-sm cursor-pointer ${
                        page === currentPage
                          ? "bg-main-blue text-white"
                          : "border border-box-outline hover:bg-gray-50 dark:text-white dark:hover:bg-dark-hover"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => loadPage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(pagination.total / 10)}
                    className="px-3 py-1.5 border border-box-outline rounded-md dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
