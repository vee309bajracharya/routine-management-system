/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Plus, Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import { AcademicYearEditValidationSchema } from "../../../../validations/AcademicYearValidationSchema";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const fetchAcademicYears = useCallback(
    async (page = 1, filters = {}) => {
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
    },
    []
  );

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
        `/admin/academic-years/${yearId}`
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Academic year deleted successfully"
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
          error.response.data.message || "Cannot delete academic year"
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
            Are you sure you want to delete this academic year?
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
                await deleteAcademicYear(year.id);
              }}
              className="px-3 py-1.5 rounded-md bg-error-red hover:bg-red-700 text-white transition-colors"
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
      }
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
        updateData
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Academic year updated successfully"
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
      <div className="mb-8">
        <h1 className="form-header text-2xl font-bold">Academic Years</h1>
        <p className="form-subtext">
          Manage all academic years and semester data here, including duration,
          status, and slot details.
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
            <option value="">Active</option>
            <option value="1">True</option>
            <option value="0">False</option>
          </select>
        </div>

        <div className="flex items-center gap-3 flex-1 md:justify-end">
          <div className="relative w-full max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Name / Department Code"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() =>
              navigate("/admin/academic-structure/academic-years")
            }
            className="btn-link"
          >
            Add Academic Year
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="text-sub-text text-sm">Loading academic years...</p>
        </div>
      ) : academicYears.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-dark-hover rounded-lg">
          <p className="text-sub-text text-base">No academic years found</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th">Academic Year ID</th>
                    <th className="table-th">Department</th>
                    <th className="table-th">Academic Year Name</th>
                    <th className="table-th">Start Date</th>
                    <th className="table-th">End Date</th>
                    <th className="table-th">Semesters</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-box-outline">
                  {academicYears.map((year) => (
                    <tr key={year.id} className="table-tbody-tr">
                      <td className="p-4 font-semibold">
                        ACA-{String(year.id).padStart(4, "0")}
                      </td>
                      <td className="p-4 text-main-blue font-semibold hover:underline cursor-pointer">
                        {year.department?.code || "N/A"}
                      </td>
                      <td className="p-4">{year.year_name}</td>
                      <td className="p-4">{year.start_date}</td>
                      <td className="p-4">{year.end_date}</td>
                      <td className="p-4 text-center">
                        {year.semesters_count || 0}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditClick(year)}
                            className="action-edit-btn"
                            aria-label="Edit academic year"
                          >
                            <Pencil
                              size={16}
                              className="text-primary-text dark:text-white"
                            />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(year)}
                            className="action-delete-btn"
                            aria-label="Delete academic year"
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

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && selectedYear && (
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

              <h2 className="form-header">Edit Academic Year Details</h2>
              <p className="text-sm text-main-blue font-medium mb-6">
                Academic Year: {selectedYear.year_name}
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="form-title">Academic Year Name</label>
                  <input
                    type="text"
                    name="year_name"
                    value={values.year_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  />
                  {touched.year_name && errors.year_name && (
                    <p className="showError">{errors.year_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-title">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={values.start_date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.start_date && errors.start_date && (
                      <p className="showError">{errors.start_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-title">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={values.end_date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.end_date && errors.end_date && (
                      <p className="showError">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-title">Active</label>
                  <div className="flex gap-8 mt-2">
                    {[
                      { value: true, label: "True" },
                      { value: false, label: "False" },
                    ].map((status) => (
                      <label
                        key={String(status.value)}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="is_active"
                          checked={values.is_active === status.value}
                          onChange={() =>
                            setFieldValue("is_active", status.value)
                          }
                          onBlur={handleBlur}
                        />
                        <span className="form-radio-title">{status.label}</span>
                      </label>
                    ))}
                  </div>
                  {touched.is_active && errors.is_active && (
                    <p className="showError">{errors.is_active}</p>
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

export default AcademicYearsList;