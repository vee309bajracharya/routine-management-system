/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Plus, Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { useAuth } from "../../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { DepartmentEditValidationSchema } from "../../../../validations/DepartmentValidationSchema";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DepartmentList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Custom debounce hook
  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
  };

  // Data States
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments
  const fetchDepartments = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/departments", { params });

      if (response.data.success) {
        setDepartments(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast.error(error.userMessage || "Failed to fetch departments");
      setDepartments([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch teachers for dropdown
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await axiosClient.get("/admin/dropdowns/teachers");
      if (res.data.success) {
        setTeachers(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
  }, [fetchDepartments, fetchTeachers]);

  // Fetch when filters change
  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      status: statusFilter || null,
    };
    fetchDepartments(currentPage, filters);
  }, [currentPage, debouncedSearch, statusFilter, fetchDepartments]);

  // Delete department
  const deleteDepartment = async (deptId) => {
    try {
      const response = await axiosClient.delete(`/admin/departments/${deptId}`);

      if (response.data.success) {
        toast.success(
          response.data.message || "Department deleted successfully"
        );
        await fetchDepartments(currentPage, {
          search: searchTerm?.trim() || null,
          status: statusFilter || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete department:", error);

      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Cannot delete department");
      } else {
        toast.error(error.userMessage || "Failed to delete department");
      }
    }
  };

  // Handle delete with confirmation
  const handleConfirmDelete = (dept) => {
    if (!dept) return;

    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete {dept.department_name}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure you want to delete this department?
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
                await deleteDepartment(dept.id);
              }}
              className="px-3 py-1.5 rounded-md bg-error-red hover:bg-red-700 text-white transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-dept-${dept.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  // Edit Modal Formik
  const formik = useFormik({
    initialValues: selectedDept
      ? {
          department_name: selectedDept.department_name || "",
          code: selectedDept.code || "",
          head_teacher_id: selectedDept?.head_teacher?.id
            ? String(selectedDept.head_teacher.id)
            : "",
          description: selectedDept.description || "",
          status: selectedDept.status || "active",
        }
      : {
          department_name: "",
          code: "",
          head_teacher_id: "",
          description: "",
          
        },
    validationSchema: DepartmentEditValidationSchema,
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

  // Open edit modal - FIXED: Use head_teacher.id which is the user_id
  const handleEditClick = (dept) => {
    setSelectedDept(dept);

    resetForm({
      values: {
        department_name: dept.department_name || "",
        code: dept.code || "",
        head_teacher_id: dept.head_teacher?.id ? String(dept.head_teacher.id) : "",
        description: dept.description || "",
        status: dept.status || "active",
      },
    });

    setIsEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedDept(null);
    resetForm();
  };

  // Handle edit submit - FIXED: Compare with head_teacher.id (user_id)
  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};

      // Only send changed fields
      if (values.department_name !== selectedDept.department_name) {
        updateData.department_name = values.department_name;
      }
      if (values.code !== selectedDept.code) {
        updateData.code = values.code.toUpperCase();
      }
      
      // FIXED: Compare with selectedDept.head_teacher.id (which is user_id from API)
      const currentHeadTeacherId = selectedDept.head_teacher?.id || "";
      if (values.head_teacher_id !== String(currentHeadTeacherId)) {
        updateData.head_teacher_id = values.head_teacher_id || null;
      }
      
      if (values.description !== selectedDept.description) {
        updateData.description = values.description || null;
      }
      if (values.status !== selectedDept.status) {
        updateData.status = values.status;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/departments/${selectedDept.id}`,
        updateData
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Department updated successfully"
        );
        handleCloseModal();
        await fetchDepartments(currentPage, {
          search: searchTerm?.trim() || null,
          status: statusFilter || null,
        });
      }
    } catch (error) {
      console.error("Update failed:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.error || error.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to update department");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);

    if (filterType === "search") {
      setSearchTerm(value);
    } else if (filterType === "status") {
      setStatusFilter(value);
    }
  };

  // Pagination handler
  const loadPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="academic-common-bg">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="form-header text-2xl font-bold">Departments</h1>
        <p className="form-subtext">
          Manage all department data here, including adding new departments,
          editing details, viewing, and deleting entries.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            className="dropdown-select cursor-pointer"
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-3 flex-1 md:justify-end">
          <div className="relative w-full max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Name or Code"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() =>
              navigate("/admin/academic-structure/academic-departments")
            }
            className="btn-link"
          >
            Add Department
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="text-sub-text text-sm">Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-dark-hover rounded-lg">
          <p className="text-sub-text text-base">No departments found</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th whitespace-nowrap">
                      Department ID
                    </th>
                    <th className="table-th">Department Name</th>
                    <th className="table-th whitespace-nowrap">Code</th>
                    <th className="table-th">Description</th>
                    <th className="table-th whitespace-nowrap">
                      Head of Department
                    </th>
                    <th className="table-th">Teachers</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-box-outline">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="table-tbody-tr">
                      <td className="p-4 font-semibold">
                        DEP-{String(dept.id).padStart(4, "0")}
                      </td>
                      <td className="p-4 text-main-blue font-semibold hover:underline cursor-pointer">
                        {dept.department_name}
                      </td>
                      <td className="p-4">{dept.code}</td>
                      <td className="p-4 max-w-[200px]">
                        <p className="truncate" title={dept.description}>
                          {dept.description || "N/A"}
                        </p>
                      </td>
                      <td className="p-4">
                        {dept.head_teacher?.name || "N/A"}
                      </td>
                      <td className="p-4 text-center">
                        {dept.teachers_count || 0}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-sm text-sm uppercase ${
                            dept.status === "active"
                              ? "table-active"
                              : "table-inactive"
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="action-edit-btn"
                            onClick={() => handleEditClick(dept)}
                            aria-label="Edit department"
                          >
                            <Pencil
                              size={16}
                              className="text-primary-text dark:text-white"
                            />
                          </button>
                          <button
                            className="action-delete-btn"
                            onClick={() => handleConfirmDelete(dept)}
                            aria-label="Delete department"
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

          {/* Pagination */}
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

      {/* EDIT MODAL - FIXED: Use teacher.user_id in dropdown */}
      <AnimatePresence>
        {isEditModalOpen && selectedDept && (
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
              className="relative bg-white dark:bg-dark-overlay w-full max-w-lg rounded-2xl shadow-2xl p-8 z-10"
            >
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 p-1 x-btn"
              >
                <X size={20} />
              </button>

              <h2 className="form-header">Edit Department</h2>
              <p className="text-sm text-main-blue font-medium mb-6">
                Department: {selectedDept.department_name}
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="form-title">Department Name</label>
                  <input
                    type="text"
                    name="department_name"
                    value={values.department_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  />
                  {touched.department_name && errors.department_name && (
                    <p className="showError">{errors.department_name}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Department Code</label>
                  <input
                    type="text"
                    name="code"
                    value={values.code}
                    onChange={(e) => {
                      const upperValue = e.target.value.toUpperCase();
                      setFieldValue("code", upperValue);
                    }}
                    onBlur={handleBlur}
                    className="dropdown-select uppercase"
                  />
                  {touched.code && errors.code && (
                    <p className="showError">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Head of Department</label>
                  <select
                    name="head_teacher_id"
                    value={values.head_teacher_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  >
                    <option value="">Select Head of Department</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={String(teacher.user_id)}>
                        {teacher.display_label || teacher.name}
                      </option>
                    ))}
                  </select>
                  {touched.head_teacher_id && errors.head_teacher_id && (
                    <p className="showError">{errors.head_teacher_id}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Description</label>
                  <textarea
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="textarea-input h-24"
                  />
                  {touched.description && errors.description && (
                    <p className="showError">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Status</label>
                  <div className="flex gap-8">
                    {["active", "inactive"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={values.status === status}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <span className="form-radio-title">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
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

export default DepartmentList;