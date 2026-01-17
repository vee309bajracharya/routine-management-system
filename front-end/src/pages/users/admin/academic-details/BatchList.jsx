/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Plus, Search, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
            Are you sure you want to delete this batch?
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
                await deleteBatch(batch.id);
              }}
              className="px-3 py-1.5 rounded-md bg-error-red hover:bg-red-700 text-white transition-colors"
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
      <div className="mb-8">
        <h1 className="form-header text-2xl font-bold">Batches</h1>
        <p className="form-subtext">
          Manage all academic batches here, including batch name, code, year level,
          shift, and status details.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            className="dropdown-select cursor-pointer"
            value={filterStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-3 flex-1 md:justify-end">
          <div className="relative w-full max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Batch / Semester / Department"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate("/admin/academic-structure/batches")}
            className="btn-link"
          >
            Add Batch
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="text-sub-text text-sm">Loading batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-dark-hover rounded-lg">
          <p className="text-sub-text text-base">No batches found</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden">
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
                      <td className="p-4 font-medium">
                        BATCH-{String(batch.id).padStart(4, "0")}
                      </td>
                      <td className="p-4 text-main-blue font-semibold hover:underline cursor-pointer">
                        {batch.department?.code || "N/A"}
                      </td>
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
                            <Pencil
                              size={16}
                              className="text-primary-text dark:text-white"
                            />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(batch)}
                            className="action-delete-btn"
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

      {/* EDIT BATCH MODAL */}
      <AnimatePresence>
        {isEditModalOpen && selectedBatch && (
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
              className="relative bg-white dark:bg-dark-overlay w-full max-w-xl rounded-2xl shadow-2xl p-8 z-10"
            >
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 p-1 x-btn"
              >
                <X size={20} />
              </button>

              <h2 className="form-header">Edit Batch Details</h2>
              <p className="text-sm text-main-blue font-medium mb-6">
                Batch: {selectedBatch.batch_name}
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* LOCKED INFO SECTION */}
                <div className="grid grid-cols-2 gap-4 mb-3 border border-box-outline p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
                  <div className="col-span-1">
                    <label className="form-title">Department</label>
                    <input
                      type="text"
                      value={selectedBatch.department?.code || "N/A"}
                      className="dropdown-select"
                      disabled
                    />
                    <p className="mt-0.5 text-xs text-gray-400">
                      Cannot be changed after creation
                    </p>
                  </div>

                  <div className="col-span-1">
                    <label className="form-title">Semester</label>
                    <input
                      type="text"
                      value={selectedBatch.semester?.semester_name || "N/A"}
                      className="dropdown-select"
                      disabled
                    />
                  </div>
                </div>

                {/* EDITABLE FIELDS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="form-title">Batch Name</label>
                    <input
                      type="text"
                      name="batch_name"
                      value={values.batch_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.batch_name && errors.batch_name && (
                      <p className="showError">{errors.batch_name}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="form-title">Batch Code</label>
                    <input
                      type="text"
                      name="code"
                      value={values.code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.code && errors.code && (
                      <p className="showError">{errors.code}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="form-title">Year Level</label>
                    <input
                      type="number"
                      name="year_level"
                      value={values.year_level}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                      min="1"
                      max="8"
                    />
                    {touched.year_level && errors.year_level && (
                      <p className="showError">{errors.year_level}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="form-title">Shift</label>
                    <div className="flex gap-4 mt-2">
                      {["Morning", "Day", "Evening"].map((shift) => (
                        <label
                          key={shift}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="shift"
                            value={shift}
                            checked={values.shift === shift}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="accent-main-blue"
                          />
                          <span className="form-radio-title">{shift}</span>
                        </label>
                      ))}
                    </div>
                    {touched.shift && errors.shift && (
                      <p className="showError">{errors.shift}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="form-title">Status</label>
                    <div className="flex gap-6 mt-2">
                      {["active", "inactive", "completed"].map((status) => (
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
                            className="accent-main-blue"
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
                </div>

                {/* Action Buttons */}
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

export default BatchList;