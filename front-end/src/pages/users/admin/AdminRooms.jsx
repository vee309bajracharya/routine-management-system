/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Plus, Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import axiosClient from "../../../services/api/axiosClient";
import { toast } from "react-toastify";
import { RoomEditValidationSchema } from "../../../validations/RoomValidationSchema";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AdminRooms = () => {
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
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch rooms
  const fetchRooms = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/rooms", { params });

      if (response.data.success) {
        setRooms(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error(error.userMessage || "Failed to fetch rooms");
      setRooms([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Fetch when filters change
  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      room_type: filterType || null,
      status: filterStatus || null,
    };
    fetchRooms(currentPage, filters);
  }, [currentPage, debouncedSearch, filterType, filterStatus, fetchRooms]);

  // Delete room
  const deleteRoom = async (roomId) => {
    try {
      const response = await axiosClient.delete(`/admin/rooms/${roomId}`);

      if (response.data.success) {
        toast.success(response.data.message || "Room deleted successfully");
        await fetchRooms(currentPage, {
          search: searchTerm?.trim() || null,
          room_type: filterType || null,
          status: filterStatus || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete room:", error);

      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Cannot delete room");
      } else {
        toast.error(error.userMessage || "Failed to delete room");
      }
    }
  };

  // Handle delete with confirmation
  const handleConfirmDelete = (room) => {
    if (!room) return;

    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete {room.name}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure you want to delete this room?
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
                await deleteRoom(room.id);
              }}
              className="px-3 py-1.5 rounded-md bg-error-red hover:bg-red-700 text-white transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-room-${room.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  // Edit Modal Formik
  const formik = useFormik({
    initialValues: selectedRoom
      ? {
          name: selectedRoom.name || "",
          room_number: selectedRoom.room_number || "",
          room_type: selectedRoom.room_type || "Classroom",
          status: selectedRoom.status || "active",
        }
      : {
          name: "",
          room_number: "",
          room_type: "Classroom",
          status: "active",
        },
    validationSchema: RoomEditValidationSchema,
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
  const handleEditClick = (room) => {
    setSelectedRoom(room);

    resetForm({
      values: {
        name: room.name || "",
        room_number: room.room_number || "",
        room_type: room.room_type || "Classroom",
        status: room.status || "active",
      },
    });

    setIsEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedRoom(null);
    resetForm();
  };

  // Handle edit submit
  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};

      // Only send changed fields
      if (values.name !== selectedRoom.name) {
        updateData.name = values.name;
      }
      if (values.room_number !== selectedRoom.room_number) {
        updateData.room_number = values.room_number;
      }
      if (values.room_type !== selectedRoom.room_type) {
        updateData.room_type = values.room_type;
      }
      if (values.status !== selectedRoom.status) {
        updateData.status = values.status;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/rooms/${selectedRoom.id}`,
        updateData
      );

      if (response.data.success) {
        toast.success(response.data.message || "Room updated successfully");
        handleCloseModal();
        await fetchRooms(currentPage, {
          search: searchTerm?.trim() || null,
          room_type: filterType || null,
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
        toast.error(error.userMessage || "Failed to update room");
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
    } else if (filterKey === "type") {
      setFilterType(value);
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
        <h1 className="form-header text-2xl font-bold">Rooms</h1>
        <p className="form-subtext">
          Manage all room data here, including adding new rooms, editing
          details, viewing, and deleting entries.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
        {/* Status + Type Filters */}
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

          {/* Room Type Buttons */}
          <div className="flex items-center gap-2">
            {["All", "Lab", "Classroom", "Lecture Hall"].map((type) => (
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
            ))}
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex items-center gap-3 flex-1 md:justify-end flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Room Name / Number"
              className="search-btn w-full pl-10"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate("/admin/academic-structure/rooms")}
            className="btn-link flex items-center gap-2 px-4 py-1"
          >
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="text-sub-text text-sm">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 dark:bg-dark-hover rounded-lg">
          <p className="text-sub-text text-base">No rooms found</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr className="text-left text-primary-text dark:text-white">
                    <th className="table-th">Room ID</th>
                    <th className="table-th">Room Name</th>
                    <th className="table-th">Room Number</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-box-outline">
                  {rooms.map((room) => (
                    <tr key={room.id} className="table-tbody-tr">
                      <td className="p-4 font-semibold">
                        RM-{String(room.id).padStart(4, "0")}
                      </td>
                      <td className="p-4 text-main-blue font-semibold hover:underline cursor-pointer">
                        {room.name}
                      </td>
                      <td className="p-4">{room.room_number}</td>
                      <td className="p-4">{room.room_type}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-sm text-sm uppercase ${
                            room.status === "active"
                              ? "table-active"
                              : "table-inactive"
                          }`}
                        >
                          {room.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-left gap-3">
                          <button
                            className="action-edit-btn"
                            onClick={() => handleEditClick(room)}
                            aria-label="Edit room"
                          >
                            <Pencil
                              size={16}
                              className="text-primary-text dark:text-white"
                            />
                          </button>
                          <button
                            className="action-delete-btn"
                            onClick={() => handleConfirmDelete(room)}
                            aria-label="Delete room"
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
        {isEditModalOpen && selectedRoom && (
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

              <h2 className="form-header">Edit Room Details</h2>
              <p className="text-sm text-main-blue font-medium mb-6">
                Room: {selectedRoom.name}
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="form-title">Room Name</label>
                  <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  />
                  {touched.name && errors.name && (
                    <p className="showError">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Room Number</label>
                  <input
                    type="text"
                    name="room_number"
                    value={values.room_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  />
                  {touched.room_number && errors.room_number && (
                    <p className="showError">{errors.room_number}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Room Type</label>
                  <select
                    name="room_type"
                    value={values.room_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Lab">Lab</option>
                  </select>
                  {touched.room_type && errors.room_type && (
                    <p className="showError">{errors.room_type}</p>
                  )}
                </div>

                <div>
                  <label className="form-title">Status</label>
                  <div className="flex gap-6 mt-2">
                    {["active", "inactive"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 cursor-pointer"
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

export default AdminRooms;