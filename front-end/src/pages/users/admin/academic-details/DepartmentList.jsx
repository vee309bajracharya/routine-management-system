/* eslint-disable no-unused-vars */
import { DepartmentEditValidationSchema } from "../../../../validations/DepartmentValidationSchema";
import { Edit, Trash2, Plus, Search, X, Loader2 } from "lucide-react";
import axiosClient from "../../../../services/api/axiosClient";
import { useAuth } from "../../../../contexts/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";

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
          response.data.message || "Department deleted successfully",
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
            Are you sure to delete this department? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={closeToast} className="toast-cancel">
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                await deleteDepartment(dept.id);
              }}
              className="toast-delete"
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
      },
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

  // Open edit modal
  const handleEditClick = (dept) => {
    setSelectedDept(dept);

    resetForm({
      values: {
        department_name: dept.department_name || "",
        code: dept.code || "",
        head_teacher_id: dept.head_teacher?.id
          ? String(dept.head_teacher.id)
          : "",
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

  // Handle edit submit
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

      // Compare with selectedDept
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
        updateData,
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Department updated successfully",
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
      <div className="mb-6 md:mb-8">
        <h1 className="form-header text-xl md:text-2xl font-bold">Departments</h1>
        <p className="form-subtext text-sm">
          Manage all department data here, including adding new departments,
          editing details, viewing, and deleting entries.
        </p>
      </div>

      {/* Action Bar */}
      <div className="actions-toolbar">
        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <select
            className="dropdown-select cursor-pointer text-sm outline-none sm:w-auto"
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            id="status"
          >
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Search and Add Button */}
        <div className="action-bar-container flex-1 sm:justify-end">
          <div className="relative flex-1 sm:max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              id="search"
              placeholder="Department Name, Code"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() =>
              navigate("/admin/academic-structure/academic-departments")
            }
            className="btn-link justify-center font-medium"
          >
            <Plus size={16} /> Add Department
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="state-container">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="state-loading">Loading Departments</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">No departments found</p>
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setCurrentPage(1);
              }}
              className="mt-3 text-sm text-main-blue hover:underline cursor-pointer"
            >
              Clear filters to see all departments
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th whitespace-nowrap">Department ID</th>
                    <th className="table-th">Department Name</th>
                    <th className="table-th whitespace-nowrap">Code</th>
                    <th className="table-th">Description</th>
                    <th className="table-th whitespace-nowrap">Head of Department</th>
                    <th className="table-th">Teachers</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-box-outline">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="table-tbody-tr">
                      <td className="p-4">DEP-{String(dept.id).padStart(4, "0")}</td>
                      <td className="p-4">{dept.department_name}</td>
                      <td className="p-4">{dept.code}</td>
                      <td className="p-4 max-w-[200px]">
                        <p className="truncate" title={dept.description}>
                          {dept.description || "N/A"}
                        </p>
                      </td>
                      <td className="p-4">
                        {dept.head_teacher?.name || "N/A"}
                      </td>
                      <td className="p-4">{dept.teachers_count || 0}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-sm text-xs capitalize ${
                            dept.status === "active"
                              ? "table-active"
                              : "table-inactive"
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <section className="flex items-center gap-3">
                          <button
                            className="action-edit-btn"
                            onClick={() => handleEditClick(dept)}
                            aria-label="Edit department"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-delete-btn"
                            onClick={() => handleConfirmDelete(dept)}
                            aria-label="Delete department"
                          >
                            <Trash2 size={16} />
                          </button>
                        </section>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-card-list">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="mobile-card-container"
              >
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-sub-text">
                        DEP-{String(dept.id).padStart(4, "0")}
                      </span>
                      <span className="mobile-card-badge">
                        {dept.code}
                      </span>
                    </div>
                    <h3 className="info-title-click">
                      {dept.department_name}
                    </h3>
                  </div>
                  <span
                    className={`status-indicator ${
                      dept.status === "active"
                        ? "table-active"
                        : "table-inactive"
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>

                {/* Department Info */}
                <div className="space-y-2 pt-2">
                  <div className="mobile-data-row">
                    <span className="text-xs text-sub-text">Head:</span>
                    <span className="text-sm text-primary-text dark:text-white font-medium text-right">
                      {dept.head_teacher?.name || "N/A"}
                    </span>
                  </div>
                  <div className="mobile-data-row">
                    <span className="info-label">Teachers:</span>
                    <span className="info-value">
                      {dept.teachers_count || 0}
                    </span>
                  </div>
                  {dept.description && (
                    <div className="pt-2 border-t border-box-outline">
                      <p className="text-xs text-sub-text mb-1">Description:</p>
                      <p className="text-sm text-primary-text dark:text-white leading-relaxed">
                        {dept.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleEditClick(dept)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="delete-mobile-btn"
                    onClick={() => handleConfirmDelete(dept)}
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
                  onClick={() => loadPage(currentPage - 1)}
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
                    onClick={() => loadPage(page)}
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
                  onClick={() => loadPage(currentPage + 1)}
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

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && selectedDept && (
          <div className="editmodal-wrapper">
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
              className="editmodal-container max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={handleCloseModal}
                className="x-btn"
              >
                <X size={20} />
              </button>

              <h2 className="form-header text-xl md:text-2xl pr-8">Edit Department Details</h2>
              <p className="form-subtitle-info">
                {selectedDept.department_name}
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="form-title sm:text-sm" htmlFor="department_name">Department Name</label>
                  <input
                    type="text"
                    id="department_name"
                    name="department_name"
                    value={values.department_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                    autoComplete="off"
                  />
                  {touched.department_name && errors.department_name && (
                    <p className="showError text-xs">{errors.department_name}</p>
                  )}
                </div>

                <div>
                  <label className="form-title sm:text-sm" htmlFor="code">Department Code</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={values.code}
                    onChange={(e) => {
                      const upperValue = e.target.value.toUpperCase();
                      setFieldValue("code", upperValue);
                    }}
                    onBlur={handleBlur}
                    className="dropdown-select uppercase text-sm"
                    autoComplete="off"
                  />
                  {touched.code && errors.code && (
                    <p className="showError text-xs">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="form-title sm:text-sm" htmlFor="head_teacher_id">Head of Department</label>
                  <select
                    id="head_teacher_id"
                    name="head_teacher_id"
                    value={values.head_teacher_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                  >
                    <option value="">Select Head of Department</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={String(teacher.user_id)} className="form-option">
                        {teacher.display_label || teacher.name}
                      </option>
                    ))}
                  </select>
                  {touched.head_teacher_id && errors.head_teacher_id && (
                    <p className="showError text-xs">{errors.head_teacher_id}</p>
                  )}
                </div>

                <div>
                  <label className="form-title sm:text-sm" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="textarea-input h-20 sm:h-24 text-sm"
                    placeholder="Enter description..."
                    autoComplete="off"
                  />
                  {touched.description && errors.description && (
                    <p className="showError text-xs">{errors.description}</p>
                  )}
                </div>

                <div>
                  <div className="form-title sm:text-sm">Status</div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 mt-2">
                    {["active", "inactive"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 cursor-pointer"
                        htmlFor={`status_${status}`}
                      >
                        <input
                          type="radio"
                          id={`status_${status}`}
                          name="status"
                          value={status}
                          checked={values.status === status}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-radio"
                        />
                        <span className="form-radio-title text-xs sm:text-sm capitalize">
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                  {touched.status && errors.status && (
                    <p className="showError text-xs">{errors.status}</p>
                  )}
                </div>

                <div className="modal-form-actions">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="modal-form-actions-cancel cancel-btn"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-form-actions-update auth-btn"
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