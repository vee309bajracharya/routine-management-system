/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Plus, Search, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import { BatchEditValidationSchema } from "../../../../validations/BatchValidationSchema";

const BatchList = () => {
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
  const [batches, setBatches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch batches
  const fetchBatches = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/batches", { params });

      if (response.data.success) {
        setBatches(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      toast.error(error.userMessage || "Failed to fetch batches");
      setBatches([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Fetch when filters change
  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      status: filterStatus || null,
    };
    fetchBatches(currentPage, filters);
  }, [currentPage, debouncedSearch, filterStatus, fetchBatches]);

  // Delete batch
  const deleteBatch = async (batchId) => {
    try {
      const response = await axiosClient.delete(`/admin/batches/${batchId}`);

      if (response.data.success) {
        toast.success(response.data.message || "Batch deleted successfully");
        await fetchBatches(currentPage, {
          search: searchTerm?.trim() || null,
          status: filterStatus || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete batch:", error);

      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Cannot delete batch");
      } else {
        toast.error(error.userMessage || "Failed to delete batch");
      }
    }
  };

  // Handle delete with confirmation
  const handleConfirmDelete = (batch) => {
    if (!batch) return;

    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete {batch.batch_name}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure to delete this batch? This action cannot be undone.
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
                await deleteBatch(batch.id);
              }}
              className="toast-delete"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-batch-${batch.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  // Edit Modal Formik
  const formik = useFormik({
    initialValues: selectedBatch
      ? {
          batch_name: selectedBatch.batch_name || "",
          code: selectedBatch.code || "",
          year_level: selectedBatch.year_level || "",
          shift: selectedBatch.shift || "Morning",
          status: selectedBatch.status || "active",
        }
      : {
          batch_name: "",
          code: "",
          year_level: "",
          shift: "Morning",
          status: "active",
        },
    validationSchema: BatchEditValidationSchema,
    onSubmit: handleEditSubmit,
    enableReinitialize: true,
  });

  const { values, errors, touched, handleChange, handleBlur, resetForm } = formik;

  // Open edit modal
  const handleEditClick = (batch) => {
    setSelectedBatch(batch);

    resetForm({
      values: {
        batch_name: batch.batch_name || "",
        code: batch.code || "",
        year_level: batch.year_level || "",
        shift: batch.shift || "Morning",
        status: batch.status || "active",
      },
    });

    setIsEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedBatch(null);
    resetForm();
  };

  // Handle edit submit
  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};

      // Only send changed fields
      if (values.batch_name !== selectedBatch.batch_name) {
        updateData.batch_name = values.batch_name;
      }
      if (values.code !== selectedBatch.code) {
        updateData.code = values.code || null;
      }
      if (parseInt(values.year_level) !== selectedBatch.year_level) {
        updateData.year_level = parseInt(values.year_level);
      }
      if (values.shift !== selectedBatch.shift) {
        updateData.shift = values.shift;
      }
      if (values.status !== selectedBatch.status) {
        updateData.status = values.status;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/batches/${selectedBatch.id}`,
        updateData
      );

      if (response.data.success) {
        toast.success(response.data.message || "Batch updated successfully");
        handleCloseModal();
        await fetchBatches(currentPage, {
          search: searchTerm?.trim() || null,
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
        toast.error(error.userMessage || "Failed to update batch");
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
      setFilterStatus(value);
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
        <h1 className="form-header text-xl md:text-2xl">Batches</h1>
        <p className="form-subtext text-sm">
          Manage all academic batches here, including batch name, code, year level,
          shift, and status details.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Filter Dropdown */}
        <div className="actions-toolbar">
          <select
            className="dropdown-select cursor-pointer text-sm outline-none sm:w-auto"
            value={filterStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            id="status"
          >
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Search and Add Button */}
        <div className="action-bar-container">
          <div className="relative flex-1 sm:w-64">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Batch, Semester, Department"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              autoComplete="off"
              id="search"
            />
          </div>
          <button
            onClick={() => navigate("/admin/academic-structure/batches")}
            className="btn-link justify-center font-medium"
          >
            <Plus size={16} /> Add Batch
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="state-container">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="state-loading">Loading Batches</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">No batches found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th">Batch ID</th>
                    <th className="table-th">Department</th>
                    <th className="table-th">Semester</th>
                    <th className="table-th">Batch Name</th>
                    <th className="table-th">Code</th>
                    <th className="table-th">Year Level</th>
                    <th className="table-th">Shift</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-box-outline">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="table-tbody-tr">
                      <td className="p-4">BATCH-{String(batch.id).padStart(4, "0")}</td>
                      <td className="p-4">{batch.department?.code || "N/A"}</td>
                      <td className="p-4">{batch.semester?.semester_name || "N/A"}</td>
                      <td className="p-4">{batch.batch_name}</td>
                      <td className="p-4">{batch.code || "N/A"}</td>
                      <td className="p-4">{batch.year_level}</td>
                      <td className="p-4">{batch.shift}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-sm text-sm uppercase ${
                            batch.status === "active"
                              ? "table-active"
                              : batch.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "table-inactive"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditClick(batch)}
                            className="action-edit-btn"
                          >
                            <Edit size={16}/>
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(batch)}
                            className="action-delete-btn"
                          >
                            <Trash2 size={16}/>
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
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="mobile-card-container"
              >
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="mobile-card-badge">
                        {batch.department?.code || "N/A"}
                      </span>
                      <span className="text-xs text-sub-text">
                        BATCH-{String(batch.id).padStart(4, "0")}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-primary-text dark:text-white">
                      {batch.batch_name}
                    </h3>
                    <p className="text-sm text-main-blue font-medium mt-1">
                      {batch.semester?.semester_name || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs uppercase whitespace-nowrap ${
                      batch.status === "active"
                        ? "table-active"
                        : batch.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "table-inactive"
                    }`}
                  >
                    {batch.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid  gap-3 pt-2">
                  <div>
                    <p className="info-label">Code</p>
                    <p className="info-value">
                      {batch.code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="info-label">Year Level</p>
                    <p className="info-value">
                      {batch.year_level}
                    </p>
                  </div>
                  <div>
                    <p className="info-label">Shift</p>
                    <p className="info-value">
                      {batch.shift}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleEditClick(batch)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="delete-mobile-btn"
                    onClick={() => handleConfirmDelete(batch)}
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
                of <span className="font-semibold">{pagination.total}</span> results
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => loadPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-prev-btn"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
                  (page) => (
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
                  )
                )}

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

      {/* EDIT BATCH MODAL */}
      <AnimatePresence>
        {isEditModalOpen && selectedBatch && (
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

              <h2 className="form-header text-xl md:text-2xl pr-8">Edit Batch Details</h2>
              <p className="form-subtitle-info">
                {selectedBatch.batch_name}
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* LOCKED INFO SECTION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 border border-box-outline p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-gray-50 dark:bg-gray-800">
                  <div className="col-span-1">
                    <label className="form-title sm:text-sm" htmlFor="department">Department</label>
                    <input
                      type="text"
                      value={selectedBatch.department?.code || "N/A"}
                      className="dropdown-select cursor-not-allowed text-sm"
                      id="department"
                      autoComplete="off"
                      disabled
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="form-title sm:text-sm" htmlFor="semester">Semester</label>
                    <input
                      type="text"
                      value={selectedBatch.semester?.semester_name || "N/A"}
                      className="dropdown-select cursor-not-allowed text-sm"
                      id="semester"
                      autoComplete="off"
                      disabled
                    />
                  </div>
                  <p className="col-span-1 sm:col-span-2 text-xs text-center text-sub-text">
                    Cannot be changed after creation
                  </p>
                </div>

                {/* EDITABLE FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="col-span-1">
                    <label className="form-title sm:text-sm" htmlFor="batch_name">Batch Name</label>
                    <input
                      type="text"
                      id="batch_name"
                      name="batch_name"
                      value={values.batch_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                      autoComplete="off"
                    />
                    {touched.batch_name && errors.batch_name && (
                      <p className="showError text-xs">{errors.batch_name}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="form-title sm:text-sm" htmlFor="code">Batch Code</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={values.code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                      autoComplete="off"
                    />
                    {touched.code && errors.code && (
                      <p className="showError text-xs">{errors.code}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="form-title sm:text-sm" htmlFor="year_level">Year Level</label>
                    <input
                      type="number"
                      id="year_level"
                      name="year_level"
                      value={values.year_level}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                      min="1"
                      max="10"
                      autoComplete="off"
                    />
                    {touched.year_level && errors.year_level && (
                      <p className="showError text-xs">{errors.year_level}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <div className="form-title sm:text-sm">Shift</div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                      {["Morning", "Day", "Evening"].map((shift) => (
                        <label
                          key={shift}
                          className="flex items-center gap-2 cursor-pointer"
                          htmlFor={`shift_${shift}`}
                        >
                          <input
                            type="radio"
                            id={`shift_${shift}`}
                            name="shift"
                            value={shift}
                            checked={values.shift === shift}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-radio"
                          />
                          <span className="form-radio-title text-xs sm:text-sm">{shift}</span>
                        </label>
                      ))}
                    </div>
                    {touched.shift && errors.shift && (
                      <p className="showError text-xs">{errors.shift}</p>
                    )}
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <div className="form-title sm:text-sm">Status</div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2">
                      {["active", "inactive", "completed"].map((status) => (
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
                          <span className="form-radio-title text-xs sm:text-sm">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                    {touched.status && errors.status && (
                      <p className="showError text-xs">{errors.status}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
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

export default BatchList;