/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Plus, Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import { SemesterEditValidationSchema } from "../../../../validations/SemesterValidatoinSchema";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SemesterList = () => {
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
  const [semesters, setSemesters] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSem, setSelectedSem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch semesters
  const fetchSemesters = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/semesters", { params });

      if (response.data.success) {
        setSemesters(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
      toast.error(error.userMessage || "Failed to fetch semesters");
      setSemesters([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  // Fetch when filters change
  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      is_active: statusFilter || null,
    };
    fetchSemesters(currentPage, filters);
  }, [currentPage, debouncedSearch, statusFilter, fetchSemesters]);

  // Delete semester
  const deleteSemester = async (semId) => {
    try {
      const response = await axiosClient.delete(`/admin/semesters/${semId}`);

      if (response.data.success) {
        toast.success(
          response.data.message || "Semester deleted successfully"
        );
        await fetchSemesters(currentPage, {
          search: searchTerm?.trim() || null,
          is_active: statusFilter || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete semester:", error);

      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Cannot delete semester");
      } else {
        toast.error(error.userMessage || "Failed to delete semester");
      }
    }
  };

  // Handle delete with confirmation
  const handleConfirmDelete = (sem) => {
    if (!sem) return;

    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete {sem.semester_name}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure you want to delete this semester?
            <br />
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeToast}
              className="toast-cancel"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                await deleteSemester(sem.id);
              }}
              className="toast-delete"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-sem-${sem.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  // Edit Modal Formik
  const formik = useFormik({
    initialValues: selectedSem
      ? {
          semester_name: selectedSem.semester_name || "",
          semester_number: selectedSem.semester_number || "",
          start_date: selectedSem.start_date || "",
          end_date: selectedSem.end_date || "",
          is_active: selectedSem.is_active ?? true,
        }
      : {
          semester_name: "",
          semester_number: "",
          start_date: "",
          end_date: "",
          is_active: true,
        },
    validationSchema: SemesterEditValidationSchema,
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
  const handleEditClick = (sem) => {
    setSelectedSem(sem);

    resetForm({
      values: {
        semester_name: sem.semester_name || "",
        semester_number: sem.semester_number || "",
        start_date: sem.start_date || "",
        end_date: sem.end_date || "",
        is_active: sem.is_active ?? true,
      },
    });

    setIsEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedSem(null);
    resetForm();
  };

  // Handle edit submit
  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};

      // Only send changed fields
      if (values.semester_name !== selectedSem.semester_name) {
        updateData.semester_name = values.semester_name;
      }
      if (parseInt(values.semester_number) !== selectedSem.semester_number) {
        updateData.semester_number = parseInt(values.semester_number);
      }
      if (values.start_date !== selectedSem.start_date) {
        updateData.start_date = values.start_date;
      }
      if (values.end_date !== selectedSem.end_date) {
        updateData.end_date = values.end_date;
      }
      if (values.is_active !== selectedSem.is_active) {
        updateData.is_active = values.is_active;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/semesters/${selectedSem.id}`,
        updateData
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Semester updated successfully"
        );
        handleCloseModal();
        await fetchSemesters(currentPage, {
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
        toast.error(error.userMessage || "Failed to update semester");
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
        <h1 className="form-header  md:text-2xl">Semesters</h1>
        <p className="form-subtext">
          Manage all semester data here, including duration, status, and slot
          details.
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
              type="text"
              placeholder="Search by Semester / Academic Year"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate("/admin/academic-structure/semesters")}
            className="btn-link justify-center font-medium"
          >
            <Plus size={16} /> Add Semester
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="state-container">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="state-loading">Loading semesters...</p>
        </div>
      ) : semesters.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">No semesters found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th">Semester ID</th>
                    <th className="table-th">Academic Year</th>
                    <th className="table-th">Semester Name</th>
                    <th className="table-th">Semester Number</th>
                    <th className="table-th">Start Date</th>
                    <th className="table-th">End Date</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-box-outline">
                  {semesters.map((sem) => (
                    <tr key={sem.id} className="table-tbody-tr">
                      <td className="p-4">SEM-{String(sem.id).padStart(4, "0")}</td>
                      <td className="p-4">{sem.academic_year?.year_name || "N/A"}</td>
                      <td className="p-4">{sem.semester_name}</td>
                      <td className="p-4 text-center">{sem.semester_number}</td>
                      <td className="p-4">{sem.start_date}</td>
                      <td className="p-4">{sem.end_date}</td>
                      <td className="p-4">
                        <section className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditClick(sem)}
                            className="action-edit-btn"
                            aria-label="Edit semester"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(sem)}
                            className="action-delete-btn"
                            aria-label="Delete semester"
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
            {semesters.map((sem) => (
              <div
                key={sem.id}
                className="mobile-card-container"
              >
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-sub-text">
                        SEM-{String(sem.id).padStart(4, "0")}
                      </span>
                      <span className="mobile-card-badge">
                        Sem {sem.semester_number}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-primary-text dark:text-white">
                      {sem.semester_name}
                    </h3>
                    <p className="text-sm text-main-blue font-medium mt-1">
                      {sem.academic_year?.year_name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Semester Info */}
                <div className="space-y-2 pt-2">
                  <div className="mobile-data-row">
                    <span className="text-xs text-sub-text">Start Date:</span>
                    <span className="text-sm text-primary-text dark:text-white font-medium">
                      {sem.start_date}
                    </span>
                  </div>
                  <div className="mobile-data-row">
                    <span className="text-xs text-sub-text">End Date:</span>
                    <span className="text-sm text-primary-text dark:text-white font-medium">
                      {sem.end_date}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleEditClick(sem)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="delete-mobile-btn"
                    onClick={() => handleConfirmDelete(sem)}
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
                <span className="font-semibold">{(currentPage - 1) * pagination.per_page + 1}</span>{" "}
                to{" "}
                <span className="font-semibold">{Math.min(currentPage * pagination.per_page, pagination.total)}</span>{" "}
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
                  (_, i) => i + 1
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
        {isEditModalOpen && selectedSem && (
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

              <h2 className="form-header text-xl md:text-2xl pr-8">Edit Semester Details</h2>
              <p className="form-subtitle-info">
                Semester: {selectedSem.semester_name}
              </p>

              {/* Academic Year read-only */}
              <div className="mb-4">
                <label className="form-title sm:text-sm">Academic Year</label>
                <input
                  type="text"
                  value={selectedSem.academic_year?.year_name || "N/A"}
                  disabled
                  className="dropdown-select cursor-not-allowed text-sm"
                />
                <p className="mt-0.5 text-xs text-sub-text">
                  Cannot be changed after creation
                </p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="form-title sm:text-sm">Semester Name</label>
                    <input
                      type="text"
                      name="semester_name"
                      value={values.semester_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                    />
                    {touched.semester_name && errors.semester_name && (
                      <p className="showError text-xs">{errors.semester_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-title sm:text-sm">Semester Number</label>
                    <input
                      type="number"
                      name="semester_number"
                      value={values.semester_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min="1"
                      max="8"
                      className="dropdown-select text-sm"
                    />
                    {touched.semester_number && errors.semester_number && (
                      <p className="showError text-xs">{errors.semester_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-title sm:text-sm">Start Date</label>
                    <input
                      type="date"
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
                    <label className="form-title sm:text-sm">End Date</label>
                    <input
                      type="date"
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
                  <label className="form-title sm:text-sm">Status</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 mt-2">
                    {[
                      { value: true, label: "True" },
                      { value: false, label: "False" },
                    ].map((status) => (
                      <label
                        key={String(status.value)}
                        className="form-selection-label"
                      >
                        <input
                          type="radio"
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
                    className="cancel-btn px-4 text-sm order-2 sm:order-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="auth-btn px-4 flex items-center justify-center text-sm order-1 sm:order-2"
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

export default SemesterList;