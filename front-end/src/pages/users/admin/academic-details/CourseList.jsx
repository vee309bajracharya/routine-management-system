/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  Eye,
  Loader2,
  BookOpen,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import { CourseEditValidationSchema } from "../../../../validations/CourseValidationSchema";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CourseList = () => {
  const navigate = useNavigate();
  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
  };

  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.error("Failed to fetch courses:", error);
      toast.error(error.userMessage || "Failed to fetch courses");
      setCourses([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      course_type: filterType || null,
      status: filterStatus || null,
    };
    fetchCourses(currentPage, filters);
  }, [currentPage, debouncedSearch, filterType, filterStatus, fetchCourses]);

  const fetchCourseDetails = async (courseId) => {
    setIsLoadingDetails(true);
    try {
      const response = await axiosClient.get(`/admin/courses/${courseId}`);
      if (response.data.success) {
        setCourseDetails(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch course details:", error);
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
        await fetchCourses(currentPage, {
          search: searchTerm?.trim() || null,
          course_type: filterType || null,
          status: filterStatus || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Cannot delete course");
      } else {
        toast.error(error.userMessage || "Failed to delete course");
      }
    }
  };

  const handleConfirmDelete = (course) => {
    if (!course) return;
    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete {course.course_name}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure you want to delete this course?
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
                await deleteCourse(course.id);
              }}
              className="px-3 py-1.5 rounded-md bg-error-red hover:bg-red-700 text-white transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-course-${course.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  const handleViewClick = async (course) => {
    setSelectedCourse(course);
    setIsDrawerOpen(true);
    await fetchCourseDetails(course.id);
  };

  const formik = useFormik({
    initialValues: selectedCourse
      ? {
          course_name: selectedCourse.course_name || "",
          code: selectedCourse.code || "",
          course_type: selectedCourse.course_type || "Theory",
          description: selectedCourse.description || "",
          status: selectedCourse.status || "active",
        }
      : {
          course_name: "",
          code: "",
          course_type: "Theory",
          description: "",
          status: "active",
        },
    validationSchema: CourseEditValidationSchema,
    onSubmit: handleEditSubmit,
    enableReinitialize: true,
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    resetForm,
    setFieldValue,
  } = formik;

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    resetForm({
      values: {
        course_name: course.course_name || "",
        code: course.code || "",
        course_type: course.course_type || "Theory",
        description: course.description || "",
        status: course.status || "active",
      },
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedCourse(null);
    resetForm();
  };

  async function handleEditSubmit(values) {
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
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/courses/${selectedCourse.id}`,
        updateData
      );
      if (response.data.success) {
        toast.success(response.data.message || "Course updated successfully");
        handleCloseModal();
        await fetchCourses(currentPage, {
          search: searchTerm?.trim() || null,
          course_type: filterType || null,
          status: filterStatus || null,
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to update course");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFilterChange = (filterKey, value) => {
    setCurrentPage(1);
    if (filterKey === "search") setSearchTerm(value);
    else if (filterKey === "type") setFilterType(value);
    else if (filterKey === "status") setFilterStatus(value);
  };

  const loadPage = (page) => setCurrentPage(page);

  return (
    <div className="academic-common-bg">
      <div className="mb-8">
        <h1 className="form-header text-2xl font-bold">Courses</h1>
        <p className="form-subtext">
          Manage all course data here, including adding new courses, editing
          details, viewing assignments, and deleting entries.
        </p>
      </div>
      <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <select
            className="dropdown-select cursor-pointer text-sm w-auto min-w-[120px]"
            value={filterStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center gap-2">
            {["All", "Theory", "Practical", "Theory and Practical"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() =>
                    handleFilterChange("type", type === "All" ? "" : type)
                  }
                  className={`filter-btn transition-colors whitespace-nowrap ${
                    filterType === (type === "All" ? "" : type)
                      ? "bg-main-blue text-white hover:bg-hover-blue"
                      : "bg-gray-100 text-primary-text dark:hover:text-black hover:bg-gray-200 dark:bg-dark-hover dark:text-white"
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 md:justify-end flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Course Name / Code"
              className="search-btn w-full pl-10"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate("/admin/academic-structure/courses")}
            className="btn-link flex items-center gap-2 px-4 py-1"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="text-sub-text text-sm">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-dark-hover rounded-lg">
          <p className="text-sub-text text-base">No courses found</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden">
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
                      <td className="p-4 font-semibold">
                        CO-{String(course.id).padStart(4, "0")}
                      </td>
                      <td className="p-4">
                        {course.department?.code || "N/A"}
                      </td>
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
                        <div className="flex items-center justify-left gap-3">
                          <button
                            className="action-eye-btn"
                            onClick={() => handleViewClick(course)}
                          >
                            <Eye
                              size={16}
                              className="text-primary-text dark:text-white"
                            />
                          </button>
                          <button
                            className="action-edit-btn"
                            onClick={() => handleEditClick(course)}
                          >
                            <Pencil
                              size={16}
                              className="text-primary-text dark:text-white"
                            />
                          </button>
                          <button
                            className="action-delete-btn"
                            onClick={() => handleConfirmDelete(course)}
                          >
                            <Trash2
                              size={16}
                              className="text-primary-text dark:text-white"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  {Math.min(
                    currentPage * pagination.per_page,
                    pagination.total
                  )}
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
                {Array.from(
                  { length: pagination.last_page },
                  (_, i) => i + 1
                ).map((page) => (
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
                ))}
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
      {/* VIEW DETAIL DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedCourse && (
          <motion.div
            className="fixed inset-0 z-50 font-general-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-[600px] bg-white dark:bg-dark-overlay shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="sticky top-0 bg-white dark:bg-dark-overlay p-6 border-b border-box-outline z-10">
                <div className="flex justify-between items-center">
                  <h2 className="form-header">Course Details</h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="x-btn"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <Loader2
                    size={40}
                    className="animate-spin text-main-blue mb-3"
                  />
                  <p className="text-sub-text text-sm">Loading details...</p>
                </div>
              ) : courseDetails ? (
                <div className="p-6 space-y-6 pb-24">
                  <div className="flex items-start gap-4">
                    <div className="w-15 h-15 bg-box-outline rounded-full flex-shrink-0 flex items-center justify-center">
                      <BookOpen size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary-text dark:text-white">
                        {courseDetails.course_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-gray-100 dark:bg-dark-hover text-primary-text dark:text-white px-2 py-1 rounded">
                          Code: {courseDetails.code}
                        </span>
                        <span className="text-xs bg-main-blue text-white px-2 py-1 rounded">
                          {courseDetails.course_type}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            courseDetails.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {courseDetails.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary-text dark:text-white mb-3">
                      Course Information
                    </h4>
                    <div className="space-y-4 border border-box-outline rounded-lg p-5 bg-gray-50 dark:bg-dark-hover">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-main-blue font-medium">
                          Department
                        </span>
                        <span className="text-primary-text dark:text-white">
                          {courseDetails.department?.code || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-main-blue font-medium">
                          Semester
                        </span>
                        <span className="text-primary-text dark:text-white">
                          {courseDetails.semester?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-main-blue font-medium">
                          Academic Year
                        </span>
                        <span className="text-primary-text dark:text-white">
                          {courseDetails.academic_year?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-start py-2">
                        <span className="text-main-blue font-medium">
                          Description
                        </span>
                        <span className="text-primary-text dark:text-white text-right max-w-[300px]">
                          {courseDetails.description ||
                            "No description provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary-text dark:text-white mb-2">
                      Course Assignments
                    </h4>
                    <p className="text-sm text-sub-text mb-3">
                      Teachers assigned to teach this course
                    </p>

                    {courseDetails.course_assignments &&
                    courseDetails.course_assignments.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-box-outline">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 dark:bg-dark-hover">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-text dark:text-white">
                                Teacher
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-text dark:text-white">
                                Batch
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-primary-text dark:text-white">
                                Shift
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-box-outline">
                            {courseDetails.course_assignments.map(
                              (assignment) => (
                                <tr
                                  key={assignment.id}
                                  className="hover:bg-gray-50 dark:hover:bg-dark-hover"
                                >
                                  <td className="px-3 py-2 text-sm text-primary-text dark:text-white font-semibold">
                                    {assignment.teacher?.name || "N/A"}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-main-blue">
                                    {assignment.batch?.name || "N/A"}
                                  </td>
                                  <td className="px-3 py-2 text-sm">
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs ${
                                        assignment.batch?.shift === "Morning"
                                          ? "bg-blue-50 text-blue-500 dark:bg-blue-900/30"
                                          : "bg-orange-50 text-orange-500 dark:bg-orange-900/30"
                                      }`}
                                    >
                                      {assignment.batch?.shift || "N/A"}
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 dark:bg-dark-hover rounded-lg text-center">
                        <Users
                          size={32}
                          className="mx-auto text-sub-text mb-2"
                        />
                        <p className="text-sm text-sub-text">
                          No assignments for this course yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && selectedCourse && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="background-blur"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-dark-overlay w-full max-w-2xl rounded-2xl shadow-2xl p-8 z-10"
            >
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 p-1 x-btn"
              >
                <X size={20} />
              </button>

              <h2 className="form-header">Edit Course Details</h2>
              <p className="text-sm text-main-blue font-medium mb-6">
                Course: {selectedCourse.course_name}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4 border border-box-outline p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <label className="form-title">Department</label>
                  <input
                    type="text"
                    value={selectedCourse.department?.code || "N/A"}
                    disabled
                    className="dropdown-select cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                  <p className="mt-0.5 text-xs text-gray-400">
                    Cannot be changed after creation
                  </p>
                </div>
                <div>
                  <label className="form-title">Semester</label>
                  <input
                    type="text"
                    value={selectedCourse.semester?.name || "N/A"}
                    disabled
                    className="dropdown-select cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                  <p className="mt-0.5 text-xs text-gray-400">
                    Cannot be changed after creation
                  </p>
                </div>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-title">Course Name</label>
                    <input
                      type="text"
                      name="course_name"
                      value={values.course_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.course_name && errors.course_name && (
                      <p className="showError">{errors.course_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-title">Course Code</label>
                    <input
                      type="text"
                      name="code"
                      value={values.code}
                      onChange={(e) =>
                        setFieldValue("code", e.target.value.toUpperCase())
                      }
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.code && errors.code && (
                      <p className="showError">{errors.code}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-title">Course Type</label>
                  <div className="flex gap-4 mt-2">
                    {["Theory", "Practical", "Theory and Practical"].map(
                      (type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="course_type"
                            value={type}
                            checked={values.course_type === type}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-radio"
                          />
                          <span className="form-radio-title">{type}</span>
                        </label>
                      )
                    )}
                  </div>
                  {touched.course_type && errors.course_type && (
                    <p className="showError">{errors.course_type}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Description</label>
                  <textarea
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="textarea-input resize-none h-24"
                    placeholder="Enter description..."
                  />
                  {touched.description && errors.description && (
                    <p className="showError">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Status</label>
                  <div className="flex gap-6 mt-2">
                    {[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ].map((status) => (
                      <label
                        key={status.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status.value}
                          checked={values.status === status.value}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-radio"
                        />
                        <span className="form-radio-title">{status.label}</span>
                      </label>
                    ))}
                  </div>
                  {touched.status && errors.status && (
                    <p className="showError">{errors.status}</p>
                  )}
                </div>

                <div className="flex justify-between gap-4 items-center pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="cancel-btn px-4"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="auth-btn px-4 whitespace-nowrap flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseList;
