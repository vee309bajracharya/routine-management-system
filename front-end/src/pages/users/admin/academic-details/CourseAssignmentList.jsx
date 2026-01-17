/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Plus, Search, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import CourseAssignmentDetailDrawer from "../../../../components/CourseAssignment/CourseAssignmentDetailDrawer";
import CourseAssignmentEditModal from "../../../../components/CourseAssignment/CourseAssignmentEditModal";

const CourseAssignmentList = () => {
  const navigate = useNavigate();

  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
  };

  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchAssignments = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/course-assignments", { params });
      if (response.data.success) {
        setAssignments(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      toast.error(error.userMessage || "Failed to fetch course assignments");
      setAssignments([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      status: filterStatus || null,
    };
    fetchAssignments(currentPage, filters);
  }, [currentPage, debouncedSearch, filterStatus, fetchAssignments]);

  const fetchAssignmentDetails = async (assignmentId) => {
    setIsLoadingDetails(true);
    try {
      const response = await axiosClient.get(`/admin/course-assignments/${assignmentId}`);
      if (response.data.success) {
        setAssignmentDetails(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch assignment details:", error);
      toast.error(error.userMessage || "Failed to load assignment details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleViewClick = async (assignment) => {
    setSelectedAssignment(assignment);
    setIsViewDrawerOpen(true);
    await fetchAssignmentDetails(assignment.id);
  };

  const handleEditClick = async (assignment) => {
    setSelectedAssignment(assignment);
    await fetchAssignmentDetails(assignment.id);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsViewDrawerOpen(false);
    setSelectedAssignment(null);
    setAssignmentDetails(null);
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      const response = await axiosClient.delete(`/admin/course-assignments/${assignmentId}`);
      if (response.data.success) {
        toast.success(response.data.message || "Assignment deleted successfully");
        await fetchAssignments(currentPage, {
          search: searchTerm?.trim() || null,
          status: filterStatus || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Cannot delete assignment");
      } else {
        toast.error(error.userMessage || "Failed to delete assignment");
      }
    }
  };

  const handleConfirmDelete = (assignment) => {
    if (!assignment) return;
    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete Assignment?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Remove {assignment.course?.name} assignment for {assignment.teacher?.name}?
            <br />
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeToast}
              className="px-3 py-1.5 bg-gray-200 text-primary-text rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                await deleteAssignment(assignment.id);
              }}
              className="px-3 py-1.5 rounded-md bg-error-red hover:bg-red-700 text-white transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-assignment-${assignment.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  const handleFilterChange = (filterKey, value) => {
    setCurrentPage(1);
    if (filterKey === "search") setSearchTerm(value);
    else if (filterKey === "status") setFilterStatus(value);
  };

  const loadPage = (page) => setCurrentPage(page);

  return (
    <div className="academic-common-bg">
      <div className="mb-8">
        <h1 className="form-header text-2xl font-bold">Course Assignments</h1>
        <p className="form-subtext">
          Manage teacher assignments to specific courses and batches.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            className="dropdown-select cursor-pointer"
            value={filterStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-3 flex-1 md:justify-end">
          <div className="relative w-full max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Course/Teacher/Batch"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate("/admin/academic-structure/course-assignments")}
            className="btn-link"
          >
            Assign Course
            <Plus size={18} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="text-sub-text text-sm">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-dark-hover rounded-lg">
          <p className="text-sub-text text-base">No course assignments found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="table-thead">
                <tr>
                  <th className="table-th">Assignment ID</th>
                  <th className="table-th">Semester</th>
                  <th className="table-th">Batch</th>
                  <th className="table-th">Course</th>
                  <th className="table-th">Teacher</th>
                  <th className="table-th">Notes</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-box-outline">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="table-tbody-tr">
                    <td className="p-4 font-semibold text-primary-text dark:text-white">
                      COAS-{String(assignment.id).padStart(3, "0")}
                    </td>
                    <td className="p-4">{assignment.semester?.name || "N/A"}</td>
                    <td className="p-4">{assignment.batch?.name || "N/A"}</td>
                    <td
                      className="p-4 text-main-blue font-semibold hover:underline cursor-pointer"
                      onClick={() => handleViewClick(assignment)}
                    >
                      {assignment.course?.name || "N/A"}
                    </td>
                    <td className="p-4">{assignment.teacher?.name || "N/A"}</td>
                    <td className="p-4 italic text-sm text-sub-text">
                      {assignment.notes || "N/A"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-sm text-sm uppercase ${
                          assignment.status === "active"
                            ? "table-active"
                            : assignment.status === "completed"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                            : "table-inactive"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          className="action-view-btn"
                          onClick={() => handleViewClick(assignment)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-edit-btn"
                          onClick={() => handleEditClick(assignment)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="action-delete-btn"
                          onClick={() => handleConfirmDelete(assignment)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-4 mt-4 border-t border-box-outline">
              <div className="text-sm text-primary-text dark:text-white">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * pagination.per_page + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * pagination.per_page, pagination.total)}
                </span>{" "}
                of <span className="font-semibold">{pagination.total}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-box-outline rounded-md dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => loadPage(page)}
                      className={`px-3 py-1.5 rounded-md text-sm cursor-pointer ${
                        page === currentPage
                          ? "bg-main-blue text-white"
                          : "border border-box-outline hover:bg-gray-50 dark:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => loadPage(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="px-3 py-1.5 border border-box-outline rounded-md dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <CourseAssignmentDetailDrawer
        isOpen={isViewDrawerOpen}
        onClose={closeModal}
        selectedAssignment={selectedAssignment}
        assignmentDetails={assignmentDetails}
        isLoadingDetails={isLoadingDetails}
      />

      <CourseAssignmentEditModal
        isOpen={isEditModalOpen}
        onClose={closeModal}
        selectedAssignment={selectedAssignment}
        assignmentDetails={assignmentDetails}
        isLoadingDetails={isLoadingDetails}
        onUpdateSuccess={() =>
          fetchAssignments(currentPage, {
            search: searchTerm?.trim() || null,
            status: filterStatus || null,
          })
        }
      />
    </div>
  );
};

export default CourseAssignmentList;