/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Plus, Search, X, Loader2 } from "lucide-react";
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
            Are you sure to delete this room? This action cannot be undone.
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
                await deleteRoom(room.id);
              }}
              className="toast-delete"
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

  const {values,errors,touched,handleChange,handleBlur,resetForm,} = formik;
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
      <div className="mb-6 md:mb-8">
        <h1 className="form-header">Rooms</h1>
        <p className="form-subtext text-sm">
          Manage all room data here, including adding new rooms, editing details, viewing, and deleting entries.
        </p>
      </div>

      {/* Action Bar */}
      <div className="filter-action-bar">
        {/*  Status & Type Filters */}
        <div className="filter-group">
          <div className="w-fit">
            <select
              className="dropdown-select cursor-pointer text-sm outline-none"
              value={filterStatus}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              id="status-filter"
            >
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Room Type Buttons */}
          <div className="scrollable-nav-bar">
            {["All", "Lab", "Classroom", "Lecture Hall"].map((type) => (
              <button
                key={type}
                onClick={() =>
                  handleFilterChange("type", type === "All" ? "" : type)
                }
                className={`filter-btn transition-colors whitespace-nowrap text-sm  ${
                  filterType === (type === "All" ? "" : type)
                    ? "bg-main-blue text-white"
                    : "bg-gray-100 text-primary-text dark:bg-dark-hover dark:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="action-bar-container">
          <div className="search-input-wrapper">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              id="search"
              placeholder="Room Name, Number"
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              autoComplete="off"
            />
          </div>

          <button
            onClick={() => navigate("/admin/academic-structure/rooms")}
            className="btn-link justify-center font-medium"
          >
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="state-container">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="state-loading">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">No rooms found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
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
                      <td className="p-4">
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
                        <div className="mobile-card-actions">
                          <button
                            className="action-edit-btn"
                            onClick={() => handleEditClick(room)}
                            aria-label="Edit room"
                          >
                            <Edit size={16}/>
                          </button>
                          <button
                            className="action-delete-btn"
                            onClick={() => handleConfirmDelete(room)}
                            aria-label="Delete room"
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
            {rooms.map((room) => (
              <div
                key={room.id}
                className="mobile-card-container"
              >
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="mobile-card-badge">
                        RM-{String(room.id).padStart(4, "0")}
                      </span>
                      <span
                        className={`status-indicator ${
                          room.status === "active"
                            ? "table-active"
                            : "table-inactive"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>
                    <h3 className="info-title-click">
                      {room.name}
                    </h3>
                    <p className="text-sm text-main-blue font-medium mt-1">
                      {room.room_type}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="pt-2">
                  <p className="info-label">Room Number</p>
                  <p className="info-value">
                    {room.room_number}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mobile-card-actions">
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleEditClick(room)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="delete-mobile-btn"
                    onClick={() => handleConfirmDelete(room)}
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
                    pagination.total
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
        {isEditModalOpen && selectedRoom && (
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
              <h2 className="form-header text-xl md:text-2xl pr-8">Edit Room Details</h2>
              <p className="form-subtitle-info">
                Room: {selectedRoom.name}
              </p>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="form-title sm:text-sm" htmlFor="room_name">Room Name</label>
                  <input
                    type="text"
                    id="room_name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                    autoComplete="off"
                  />
                  {touched.name && errors.name && (
                    <p className="showError text-xs">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="form-title sm:text-sm" htmlFor="room_number">Room Number</label>
                  <input
                    type="text"
                    id="room_number"
                    name="room_number"
                    value={values.room_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                    autoComplete="off"
                  />
                  {touched.room_number && errors.room_number && (
                    <p className="showError text-xs">{errors.room_number}</p>
                  )}
                </div>

                <div>
                  <label className="form-title sm:text-sm" htmlFor="room_type">Room Type</label>
                  <select
                    id="room_type"
                    name="room_type"
                    value={values.room_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Lab">Lab</option>
                  </select>
                  {touched.room_type && errors.room_type && (
                    <p className="showError text-xs">{errors.room_type}</p>
                  )}
                </div>

                <div>
                  <div className="form-title sm:text-sm">Status</div>
                  <div className="flex gap-4 sm:gap-6 mt-2">
                    {["active", "inactive"].map((status) => (
                      <label
                        key={status}
                        className="form-selection-label"
                        htmlFor={`status-${status}`}
                      >
                        <input
                          type="radio"
                          id={`status-${status}`}
                          name="status"
                          value={status}
                          checked={values.status === status}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-radio"
                        />
                        <span className="form-radio-title text-xs sm:text-sm capitalize">{status}</span>
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

export default AdminRooms;