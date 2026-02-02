/* eslint-disable no-unused-vars */
import { AcademicYearEditValidationSchema } from "../../../../validations/AcademicYearValidationSchema";
import { Edit, Trash2, Plus, Search, X, Loader2 } from "lucide-react";
import axiosClient from "../../../../services/api/axiosClient";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";

const AcademicYearsList = () => {
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
  const [academicYears, setAcademicYears] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch academic years
  const fetchAcademicYears = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/academic-years", {
        params,
      });

      if (response.data.success) {
        setAcademicYears(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch academic years:", error);
      toast.error(error.userMessage || "Failed to fetch academic years");
      setAcademicYears([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  // Fetch when filters change
  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      is_active: statusFilter || null,
    };
    fetchAcademicYears(currentPage, filters);
  }, [currentPage, debouncedSearch, statusFilter, fetchAcademicYears]);

  // Delete academic year
  const deleteAcademicYear = async (yearId) => {
    try {
      const response = await axiosClient.delete(
        `/admin/academic-years/${yearId}`,
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Academic year deleted successfully",
        );
        await fetchAcademicYears(currentPage, {
          search: searchTerm?.trim() || null,
          is_active: statusFilter || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete academic year:", error);

      if (error.response?.status === 422) {
        toast.error(
          error.response.data.message || "Cannot delete academic year",
        );
      } else {
        toast.error(error.userMessage || "Failed to delete academic year");
      }
    }
  };

  // Handle delete with confirmation
  const handleConfirmDelete = (year) => {
    if (!year) return;

    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete {year.year_name}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure to delete this academic year? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={closeToast} className="toast-cancel">
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                await deleteAcademicYear(year.id);
              }}
              className="toast-delete"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-year-${year.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      },
    );
  };

  // Edit Modal Formik
  const formik = useFormik({
    initialValues: selectedYear
      ? {
          year_name: selectedYear.year_name || "",
          start_date: selectedYear.start_date || "",
          end_date: selectedYear.end_date || "",
          is_active: selectedYear.is_active ?? true,
        }
      : {
          year_name: "",
          start_date: "",
          end_date: "",
          is_active: true,
        },
    validationSchema: AcademicYearEditValidationSchema,
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
  const handleEditClick = (year) => {
    setSelectedYear(year);

    resetForm({
      values: {
        year_name: year.year_name || "",
        start_date: year.start_date || "",
        end_date: year.end_date || "",
        is_active: year.is_active ?? true,
      },
    });

    setIsEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedYear(null);
    resetForm();
  };

  // Handle edit submit
  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};

      // Only send changed fields
      if (values.year_name !== selectedYear.year_name) {
        updateData.year_name = values.year_name;
      }
      if (values.start_date !== selectedYear.start_date) {
        updateData.start_date = values.start_date;
      }
      if (values.end_date !== selectedYear.end_date) {
        updateData.end_date = values.end_date;
      }
      if (values.is_active !== selectedYear.is_active) {
        updateData.is_active = values.is_active;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/academic-years/${selectedYear.id}`,
        updateData,
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Academic year updated successfully",
        );
        handleCloseModal();
        await fetchAcademicYears(currentPage, {
          search: searchTerm?.trim() || null,
          is_active: statusFilter || null,
        });
      }
    } catch (error) {
      console.error("Update failed:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to update academic year");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter handlers
  const handleFilterChange = (filterKey, value) => {
    setCurrentPage(1);

    if (filterKey === "search") {
      setSearchTerm(value);
    } else if (filterKey === "status") {
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
        <h1 className="form-header text-xl md:text-2xl font-bold">Academic Years</h1>
        <p className="form-subtext text-sm">
          Manage all academic years and semester data here, including
          duration, status, and slot details.
        </p>
      </div>

      {/* Action Bar */}
      <div className="actions-toolbar">
        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <select
            id="status"
            className="dropdown-select cursor-pointer text-sm outline-none sm:w-auto"
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Active</option>
            <option value="1">True</option>
            <option value="0">False</option>
          </select>
        </div>

        {/* Search and Add Button */}
        <div className="action-bar-container flex-1 sm:justify-end">
          <div className="relative flex-1 sm:max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              id="search"
              type="text"
              placeholder="Academic Year Name, Department Code"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate("/admin/academic-structure/academic-years")}
            className="btn-link justify-center font-medium"
          >
            <Plus size={16} /> Add Academic Year
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="state-container">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="state-loading">Loading Academic Years</p>
        </div>
      ) : academicYears.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">No academic years found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr>
                    <th className="table-th">Academic Year ID</th>
                    <th className="table-th">Department Code</th>
                    <th className="table-th">Academic Year Name</th>
                    <th className="table-th">Start Date</th>
                    <th className="table-th">End Date</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-box-outline">
                  {academicYears.map((year) => (
                    <tr key={year.id} className="table-tbody-tr">
                      <td className="p-4">
                        ACA-{String(year.id).padStart(4, "0")}
                      </td>
                      <td className="p-4">{year.department?.code || "N/A"}</td>
                      <td className="p-4">{year.year_name}</td>
                      <td className="p-4">{year.start_date}</td>
                      <td className="p-4">{year.end_date}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-sm text-xs capitalize ${
                            year.is_active ? "table-active" : "table-inactive"
                          }`}
                        >
                          {year.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <section className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditClick(year)}
                            className="action-edit-btn"
                            aria-label="Edit academic year"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(year)}
                            className="action-delete-btn"
                            aria-label="Delete academic year"
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
            {academicYears.map((year) => (
              <div
                key={year.id}
                className="mobile-card-container"
              >
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-sub-text">
                        ACA-{String(year.id).padStart(4, "0")}
                      </span>
                      <span className="mobile-card-badge">
                        {year.department?.code || "N/A"}
                      </span>
                    </div>
                    <h3 className="info-title-click">
                      {year.year_name}
                    </h3>
                  </div>
                  <span
                    className={`status-indicator ${
                      year.is_active ? "table-active" : "table-inactive"
                    }`}
                  >
                    {year.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Year Info */}
                <div className="space-y-2 pt-2">
                  <div className="mobile-data-row">
                    <span className="text-xs text-sub-text">Start Date:</span>
                    <span className="text-sm text-primary-text dark:text-white font-medium">
                      {year.start_date}
                    </span>
                  </div>
                  <div className="mobile-data-row">
                    <span className="text-xs text-sub-text">End Date:</span>
                    <span className="text-sm text-primary-text dark:text-white font-medium">
                      {year.end_date}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleEditClick(year)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="delete-mobile-btn"
                    onClick={() => handleConfirmDelete(year)}
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
        {isEditModalOpen && selectedYear && (
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

              <h2 className="form-header text-xl md:text-2xl pr-8">Edit Academic Year Details</h2>
              <p className="form-subtitle-info">
                {selectedYear.year_name}
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="form-title sm:text-sm" htmlFor="year_name">Academic Year Name</label>
                  <input
                    type="text"
                    id="year_name"
                    name="year_name"
                    value={values.year_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                    autoComplete="off"
                  />
                  {touched.year_name && errors.year_name && (
                    <p className="showError text-xs">{errors.year_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="form-title sm:text-sm" htmlFor="start_date">Start Date</label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={values.start_date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                    />
                    {touched.start_date && errors.start_date && (
                      <p className="showError text-xs">{errors.start_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-title sm:text-sm" htmlFor="end_date">End Date</label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={values.end_date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                    />
                    {touched.end_date && errors.end_date && (
                      <p className="showError text-xs">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="form-title sm:text-sm">Active</div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 mt-2">
                    {[
                      { value: true, label: "True" },
                      { value: false, label: "False" },
                    ].map((status) => (
                      <label
                        key={String(status.value)}
                        className="flex items-center gap-2 cursor-pointer"
                        htmlFor={`is_active_${status.value}`}
                      >
                        <input
                          type="radio"
                          id={`is_active_${status.value}`}
                          name="is_active"
                          checked={values.is_active === status.value}
                          onChange={() =>
                            setFieldValue("is_active", status.value)
                          }
                          onBlur={handleBlur}
                          className="form-radio"
                        />
                        <span className="form-radio-title text-xs sm:text-sm">{status.label}</span>
                      </label>
                    ))}
                  </div>
                  {touched.is_active && errors.is_active && (
                    <p className="showError text-xs">{errors.is_active}</p>
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

export default AcademicYearsList;