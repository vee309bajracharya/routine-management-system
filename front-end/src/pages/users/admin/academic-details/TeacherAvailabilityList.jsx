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
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import * as Yup from "yup";

const TeacherAvailabilityList = () => {
  const navigate = useNavigate();

  // Debounce hook
  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
  };

  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Status filter state hatayeko chu
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teachers with availability
  const fetchTeachers = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/teacher-availability", {
        params,
      });
      if (response.data.success) {
        setTeachers(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      toast.error(error.userMessage || "Failed to fetch teacher availability");
      setTeachers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
    };

    fetchTeachers(currentPage, filters);
  }, [currentPage, debouncedSearch, fetchTeachers]);

  // Delete availability
  const deleteAvailability = async (availabilityId) => {
    try {
      const response = await axiosClient.delete(
        `/admin/teacher-availability/${availabilityId}`
      );
      if (response.data.success) {
        toast.success(
          response.data.message || "Availability deleted successfully"
        );
        await fetchTeachers(currentPage, {
          search: searchTerm?.trim() || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete availability:", error);
      toast.error(error.userMessage || "Failed to delete availability");
    }
  };

  const handleConfirmDelete = (availability, teacherName) => {
    if (!availability) return;
    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete Availability?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure you want to delete {teacherName}'s availability on{" "}
            {availability.day_of_week}?
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
                await deleteAvailability(availability.id);
              }}
              className="px-3 py-1.5 rounded-md bg-error-red hover:bg-red-700 text-white transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-availability-${availability.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  const handleViewClick = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDrawerOpen(true);
  };

  const handleEditClick = (availability, teacher) => {
    setSelectedAvailability(availability);
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const handleFilterChange = (filterKey, value) => {
    setCurrentPage(1);
    if (filterKey === "search") setSearchTerm(value);
  };

  const loadPage = (page) => setCurrentPage(page);

  return (
    <div className="academic-common-bg">
      <div className="mb-8">
        <h1 className="form-header text-2xl font-bold">Teacher Availability</h1>
        <p className="form-subtext">
          Manage weekly time slots and availability for faculty members.
        </p>
      </div>

      {/* Action Bar - Status Filter Dropdown hatayeko chu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 md:justify-end flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Teacher Name"
              className="search-btn w-full pl-10"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <button
            onClick={() =>
              navigate("/admin/academic-structure/teacher-availability")
            }
            className="btn-link flex items-center gap-2 px-4 py-1.5"
          >
            <Plus size={16} /> Add Availability
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="text-sub-text text-sm">Loading teachers...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-dark-hover rounded-lg">
          <p className="text-sub-text text-base">
            No teachers found
          </p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th">Teacher ID</th>
                    <th className="table-th">Teacher Name</th>
                    <th className="table-th">Availability Slots</th>
                    <th className="table-th">Available Time Range</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-box-outline">
                  {teachers.map((teacher) => (
                    <tr key={teacher.teacher_id} className="table-tbody-tr">
                      <td className="p-4 font-semibold">
                        T-{String(teacher.teacher_id).padStart(4, "0")}
                      </td>
                      <td
                        className="p-4 text-main-blue font-semibold hover:underline cursor-pointer"
                        onClick={() => handleViewClick(teacher)}
                      >
                        {teacher.teacher_name}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-medium text-sm">
                          {teacher.availability_count} slot(s)
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {teacher?.schedule && teacher.schedule.length > 0 ? (
                            teacher.schedule.map((slot) => (
                              <div
                                key={slot.id}
                                className="px-2 py-1 rounded bg-gray-50 border border-box-outline text-xs"
                              >
                                <span className="font-semibold text-main-blue">
                                  {slot.day_of_week.substring(0, 3)}:{" "}
                                </span>
                                <span className="text-sub-text">
                                  {slot.available_from} - {slot.available_to}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              No schedule
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-sm text-sm uppercase ${
                            teacher.availability_count > 0
                              ? "table-active"
                              : "table-inactive"
                          }`}
                        >
                          {teacher.availability_count > 0
                            ? "Active"
                            : "Inactive"}
                        </span>
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

      {/* VIEW DRAWER */}
      <AnimatePresence>
        {isViewDrawerOpen && selectedTeacher && (
          <motion.div
            className="fixed inset-0 z-50 font-general-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/10"
              onClick={() => setIsViewDrawerOpen(false)}
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
                  <h2 className="form-header">Teacher Availability Details</h2>
                  <button
                    onClick={() => setIsViewDrawerOpen(false)}
                    className="x-btn"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 pb-24">
                <div className="flex items-start gap-4">
                  <div className="w-15 h-15 bg-box-outline rounded-full flex-shrink-0 flex items-center justify-center">
                    <Calendar size={32} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary-text dark:text-white">
                      {selectedTeacher.teacher_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-main-blue text-white px-2 py-1 rounded">
                        {selectedTeacher.availability_count} Availability
                        Slot(s)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-primary-text dark:text-white mb-3">
                    Weekly Schedule
                  </h4>

                  {selectedTeacher.schedule &&
                  selectedTeacher.schedule.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTeacher.schedule.map((availability) => (
                        <div
                          key={availability.id}
                          className="border border-box-outline rounded-lg p-4 bg-gray-50 dark:bg-dark-hover"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Clock
                                size={18}
                                className="text-main-blue flex-shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-primary-text dark:text-white">
                                  {availability.day_of_week}
                                </p>
                                <p className="text-sm text-sub-text">
                                  {availability.available_from} -{" "}
                                  {availability.available_to}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="action-edit-btn p-2"
                                onClick={() =>
                                  handleEditClick(availability, selectedTeacher)
                                }
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="action-delete-btn p-2"
                                onClick={() =>
                                  handleConfirmDelete(
                                    availability,
                                    selectedTeacher.teacher_name
                                  )
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {availability.notes && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-sub-text">
                                <span className="font-medium">Notes:</span>{" "}
                                {availability.notes}
                              </p>
                            </div>
                          )}
                          <div className="mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                availability.is_available
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30"
                              }`}
                            >
                              {availability.is_available
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-dark-hover rounded-lg text-center">
                      <Calendar
                        size={32}
                        className="mx-auto text-sub-text mb-2"
                      />
                      <p className="text-sm text-sub-text">
                        No availability slots added yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <EditAvailabilityModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAvailability(null);
          setSelectedTeacher(null);
        }}
        availability={selectedAvailability}
        teacher={selectedTeacher}
        onSuccess={() => {
          fetchTeachers(currentPage, {
            search: searchTerm?.trim() || null,
          });
        }}
      />
    </div>
  );
};

// EDIT MODAL COMPONENT (Unchanged design)
const EditAvailabilityModal = ({
  isOpen,
  onClose,
  availability,
  teacher,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    available_from: Yup.string().required("Start time is required"),
    available_to: Yup.string()
      .required("End time is required")
      .test("is-after", "End time must be after start time", function (value) {
        const { available_from } = this.parent;
        if (!available_from || !value) return true;
        return value > available_from;
      }),
    is_available: Yup.boolean(),
    notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
  });

  const formik = useFormik({
    initialValues: availability
      ? {
          available_from: availability.available_from || "",
          available_to: availability.available_to || "",
          is_available: availability.is_available ?? true,
          notes: availability.notes || "",
        }
      : {
          available_from: "",
          available_to: "",
          is_available: true,
          notes: "",
        },
    validationSchema,
    onSubmit: handleEditSubmit,
    enableReinitialize: true,
  });

  const { values, errors, touched, handleChange, handleBlur } = formik;

  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};
      if (values.available_from !== availability.available_from)
        updateData.available_from = values.available_from;
      if (values.available_to !== availability.available_to)
        updateData.available_to = values.available_to;
      if (values.is_available !== availability.is_available)
        updateData.is_available = values.is_available;
      if (values.notes !== availability.notes)
        updateData.notes = values.notes || null;

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/teacher-availability/${availability.id}`,
        updateData
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Availability updated successfully"
        );
        onClose();
        onSuccess();
      }
    } catch (error) {
      console.error("Update failed:", error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to update availability");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!availability || !teacher) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="background-blur"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-dark-overlay w-full max-w-xl rounded-2xl shadow-2xl p-8 z-10"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 x-btn"
            >
              <X size={20} />
            </button>

            <h2 className="form-header">Edit Availability</h2>
            <p className="text-sm text-main-blue font-medium mb-6">
              Teacher: {teacher.teacher_name} - {availability.day_of_week}
            </p>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-title">
                    Available From <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="time"
                    name="available_from"
                    value={values.available_from}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  />
                  {touched.available_from && errors.available_from && (
                    <p className="showError">{errors.available_from}</p>
                  )}
                </div>
                <div>
                  <label className="form-title">
                    Available To <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="time"
                    name="available_to"
                    value={values.available_to}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  />
                  {touched.available_to && errors.available_to && (
                    <p className="showError">{errors.available_to}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-title">Status</label>
                <div className="flex gap-6 mt-2">
                  {[
                    { value: true, label: "Available" },
                    { value: false, label: "Unavailable" },
                  ].map((status) => (
                    <label
                      key={status.label}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="is_available"
                        value={String(status.value)}
                        checked={values.is_available === status.value}
                        onChange={() =>
                          formik.setFieldValue("is_available", status.value)
                        }
                        onBlur={handleBlur}
                        className="form-radio"
                      />
                      <span className="form-radio-title">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-title">Notes</label>
                <textarea
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="textarea-input resize-none h-24"
                  placeholder="Add additional notes..."
                />
                {touched.notes && errors.notes && (
                  <p className="showError">{errors.notes}</p>
                )}
              </div>

              <div className="flex justify-between gap-4 items-center pt-6">
                <button
                  type="button"
                  onClick={onClose}
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
  );
};

export default TeacherAvailabilityList;