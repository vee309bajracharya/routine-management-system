/* eslint-disable no-unused-vars */
import CourseDetailDrawer from "../../../../components/CourseList/CourseDetailDrawer";
import CourseEditModal from "../../../../components/CourseList/CourseEditModal";
import { CourseEditValidationSchema } from "../../../../validations/CourseValidationSchema";
import axiosClient from "../../../../services/api/axiosClient";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useState, useEffect, useCallback } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

const CourseList = () => {
  const navigate = useNavigate();

  // Custom Debounce Hook
  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
  };

  // State Management
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);

  // Modal & Drawer State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Actions 
  const fetchCourses = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/courses", { params });
      if (response.data.success) {
        setCourses(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      toast.error(error.userMessage || "Failed to fetch courses");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCourseDetails = async (courseId) => {
    setIsLoadingDetails(true);
    try {
      const response = await axiosClient.get(`/admin/courses/${courseId}`);
      if (response.data.success) {
        setCourseDetails(response.data.data);
      }
    } catch (error) {
      toast.error(error.userMessage || "Failed to load course details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const response = await axiosClient.delete(`/admin/courses/${courseId}`);
      if (response.data.success) {
        toast.success(response.data.message || "Course deleted successfully");
        fetchCourses(currentPage, {
          search: searchTerm?.trim() || null,
          course_type: filterType || null,
          status: filterStatus || null,
        });
      }
    } catch (error) {
      const msg =
        error.response?.status === 422
          ? error.response.data.message
          : error.userMessage;
      toast.error(msg || "Failed to delete course");
    }
  };

  // Effects 
  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      course_type: filterType || null,
      status: filterStatus || null,
    };
    fetchCourses(currentPage, filters);
  }, [currentPage, debouncedSearch, filterType, filterStatus, fetchCourses]);

  // Handlers 
  const handleFilterChange = (filterKey, value) => {
    setCurrentPage(1);
    if (filterKey === "search") setSearchTerm(value);
    else if (filterKey === "type") setFilterType(value);
    else if (filterKey === "status") setFilterStatus(value);
  };

  const handleViewClick = async (course) => {
    setSelectedCourse(course);
    setIsDrawerOpen(true);
    await fetchCourseDetails(course.id);
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedCourse(null);
    formik.resetForm();
  };

  const handleConfirmDelete = (course) => {
    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete {course.course_name}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={closeToast} className="toast-cancel">
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                await deleteCourse(course.id);
              }}
              className="toast-delete"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      { toastId: `delete-${course.id}`, closeButton: false, autoClose: false },
    );
  };

  // Formik Implementation
  const formik = useFormik({
    initialValues: {
      course_name: selectedCourse?.course_name || "",
      code: selectedCourse?.code || "",
      course_type: selectedCourse?.course_type || "Theory",
      description: selectedCourse?.description || "",
      status: selectedCourse?.status || "active",
    },
    enableReinitialize: true,
    validationSchema: CourseEditValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const updateData = {};
        if (values.course_name !== selectedCourse.course_name)
          updateData.course_name = values.course_name;
        if (values.code !== selectedCourse.code)
          updateData.code = values.code.toUpperCase();
        if (values.course_type !== selectedCourse.course_type)
          updateData.course_type = values.course_type;
        if (values.description !== selectedCourse.description)
          updateData.description = values.description || null;
        if (values.status !== selectedCourse.status)
          updateData.status = values.status;

        if (Object.keys(updateData).length === 0) {
          toast.info("No changes to update");
          return;
        }

        const response = await axiosClient.put(
          `/admin/courses/${selectedCourse.id}`,
          updateData,
        );
        if (response.data.success) {
          toast.success("Course updated successfully");
          handleCloseModal();
          fetchCourses(currentPage);
        }
      } catch (error) {
        toast.error("Failed to update course");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="academic-common-bg">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="form-header">Courses</h1>
        <p className="form-subtext text-sm">
          Manage all course data, assignments, and schedules.
        </p>
      </div>

      {/* Filters & Actions */}
      <div className="filter-action-bar">
        {/* Status & Type Filters */}
        <div className="filter-group">
          {/* Status Dropdown */}
          <div className="w-fit">
            <select
              className="dropdown-select cursor-pointer text-sm outline-none"
              value={filterStatus}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Filter Buttons */}
          <div className="scrollable-nav-bar">
            {["All", "Theory", "Practical", "Theory and Practical"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() =>
                    handleFilterChange("type", type === "All" ? "" : type)
                  }
                  className={`filter-btn transition-colors whitespace-nowrap text-sm  ${
                    filterType === (type === "All" ? "" : type)
                      ? "bg-main-blue text-white"
                      : "bg-gray-100 text-primary-text dark:bg-dark-hover dark:text-white"
                  }`}
                >
                  {type}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="action-bar-container">
          <div className="search-input-wrapper">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name or code..."
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate("/admin/academic-structure/courses")}
            className="btn-link justify-center font-medium"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="state-container">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="state-loading">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">No courses found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th">Course ID</th>
                    <th className="table-th">Department</th>
                    <th className="table-th">Semester</th>
                    <th className="table-th">Course Name</th>
                    <th className="table-th">Code</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-box-outline">
                  {courses.map((course) => (
                    <tr key={course.id} className="table-tbody-tr">
                      <td className="p-4">CO-{String(course.id).padStart(4, "0")}</td>
                      <td className="p-4">{course.department?.code || "N/A"}</td>
                      <td className="p-4">{course.semester?.name || "N/A"}</td>
                      <td
                        className="p-4 text-main-blue font-semibold hover:underline cursor-pointer"
                        onClick={() => handleViewClick(course)}
                      >
                        {course.course_name}
                      </td>
                      <td className="p-4">{course.code}</td>
                      <td className="p-4">{course.course_type}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-sm text-sm uppercase ${
                            course.status === "active"
                              ? "table-active"
                              : "table-inactive"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            className="action-eye-btn"
                            onClick={() => handleViewClick(course)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-edit-btn"
                            onClick={() => handleEditClick(course)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-delete-btn"
                            onClick={() => handleConfirmDelete(course)}
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
          </div>

          {/* Mobile Card View */}
          <div className="mobile-card-list">
            {courses.map((course) => (
              <div
                key={course.id}
                className="mobile-card-container"
              >
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="mobile-card-badge">
                        {course.department?.code || "N/A"}
                      </span>
                      <span className="text-xs text-sub-text">
                        CO-{String(course.id).padStart(4, "0")}
                      </span>
                    </div>
                    <h3
                      className="info-title-click"
                      onClick={() => handleViewClick(course)}
                    >
                      {course.course_name}
                    </h3>
                    <p className="text-sm text-main-blue font-medium mt-1">
                      {course.code} • {course.semester?.name || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`status-indicator ${
                      course.status === "active"
                        ? "table-active"
                        : "table-inactive"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                {/* Course Type */}
                <div className="pt-2 ">
                  <p className="info-label">Course Type</p>
                  <p className="info-value">
                    {course.course_type}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mobile-card-actions">
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleViewClick(course)}
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleEditClick(course)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="delete-mobile-btn"
                    onClick={() => handleConfirmDelete(course)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="pagination-container flex-col sm:flex-row gap-4">
              <div className="pagination-text text-center sm:text-left">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * pagination.per_page + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(
                    currentPage * pagination.per_page,
                    pagination.total,
                  )}
                </span>{" "}
                of <span className="font-semibold">{pagination.total}</span>{" "}
                results
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="pagination-prev-btn"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from(
                  { length: pagination.last_page },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-md text-sm ${
                      page === currentPage
                        ? "bg-main-blue text-white"
                        : "border dark:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="pagination-prev-btn"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Destructured Drawer Component */}
      <CourseDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        course={selectedCourse}
        details={courseDetails}
        isLoading={isLoadingDetails}
      />

      {/* Destructured Modal Component */}
      <CourseEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        formik={formik}
        isSubmitting={isSubmitting}
        selectedCourse={selectedCourse}
      />
    </div>
  );
};

export default CourseList;
