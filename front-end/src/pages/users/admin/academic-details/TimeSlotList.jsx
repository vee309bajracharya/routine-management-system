/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Edit, Trash2, Plus, Search, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import TimeSlotDetailDrawer from "../../../../components/TimeSlotList/TimeSlotDetailDrawer";
import TimeSlotEditModal from "../../../../components/TimeSlotList/TimeSlotEditModal";

const TimeSlotList = () => {
  const navigate = useNavigate();

  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
  };

  const [timeSlots, setTimeSlots] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 450);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewSidebarOpen, setIsViewSidebarOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotDetails, setSlotDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchTimeSlots = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/time-slots", { params });
      if (response.data.success) {
        setTimeSlots(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch time slots:", error);
      toast.error(error.userMessage || "Failed to fetch time slots");
      setTimeSlots([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  useEffect(() => {
    const filters = {
      search: debouncedSearch?.trim() || null,
      shift: filterShift || null,
      is_active: filterStatus || null,
    };
    fetchTimeSlots(currentPage, filters);
  }, [currentPage, debouncedSearch, filterShift, filterStatus, fetchTimeSlots]);

  const fetchSlotDetails = async (slotId) => {
    setIsLoadingDetails(true);
    try {
      const response = await axiosClient.get(`/admin/time-slots/${slotId}`);
      if (response.data.success) {
        setSlotDetails(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch slot details:", error);
      toast.error(error.userMessage || "Failed to load slot details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleViewClick = async (slot) => {
    setSelectedSlot(slot);
    setIsViewSidebarOpen(true);
    await fetchSlotDetails(slot.id);
  };

  const handleEditClick = async (slot) => {
    setSelectedSlot(slot);
    await fetchSlotDetails(slot.id);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsViewSidebarOpen(false);
    setSelectedSlot(null);
    setSlotDetails(null);
  };

  const deleteTimeSlot = async (slotId) => {
    try {
      const response = await axiosClient.delete(`/admin/time-slots/${slotId}`);
      if (response.data.success) {
        toast.success(response.data.message || "Time slot deleted successfully");
        await fetchTimeSlots(currentPage, {
          search: searchTerm?.trim() || null,
          shift: filterShift || null,
          is_active: filterStatus || null,
        });
      }
    } catch (error) {
      console.error("Failed to delete time slot:", error);
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Cannot delete time slot");
      } else {
        toast.error(error.userMessage || "Failed to delete time slot");
      }
    }
  };

  const handleConfirmDelete = (slot) => {
    if (!slot) return;
    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete {slot.name}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure you want to delete this time slot?
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
                await deleteTimeSlot(slot.id);
              }}
              className="toast-delete"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-slot-${slot.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  const handleFilterChange = (filterKey, value) => {
    setCurrentPage(1);
    if (filterKey === "search") setSearchTerm(value);
    else if (filterKey === "shift") setFilterShift(value);
    else if (filterKey === "status") setFilterStatus(value);
  };

  const loadPage = (page) => setCurrentPage(page);

  return (
    <div className="academic-common-bg">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="form-header">Time Slots</h1>
        <p className="form-subtext text-sm">
          Manage all time slot data including creating, editing and deleting.
        </p>
      </div>

      {/* Filters & Actions  */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
          <select
            className="dropdown-select cursor-pointer text-sm outline-none"
            value={filterShift}
            onChange={(e) => handleFilterChange("shift", e.target.value)}
          >
            <option value="">Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Day">Day</option>
          </select>

          <select
            className="dropdown-select cursor-pointer text-sm outline-none"
            value={filterStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Search and Add Button */}
        <div className="action-bar-container">
          <div className="search-input-wrapper">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by Semester or Batch..."
              className="search-btn"
              value={searchTerm}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <button
            onClick={() => navigate("/admin/academic-structure/time-slots")}
            className="btn-link justify-center font-medium"
          >
            <Plus size={16} /> Add Time Slot
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="state-container">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="state-loading">Loading time slots...</p>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">No time slots found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr>
                    <th className="table-th">ID</th>
                    <th className="table-th">Semester</th>
                    <th className="table-th">Batch</th>
                    <th className="table-th">Timeslot Name</th>
                    <th className="table-th">Start</th>
                    <th className="table-th">End</th>
                    <th className="table-th">Shift</th>
                    <th className="table-th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-box-outline">
                  {timeSlots.map((slot) => (
                    <tr key={slot.id} className="table-tbody-tr">
                      <td className="p-4">TS-{String(slot.id).padStart(3, "0")}</td>
                      <td className="p-4">{slot.semester?.semester_name || "N/A"}</td>
                      <td className="p-4">{slot.batch?.name || "N/A"}</td>
                      <td
                        className="p-4 text-main-blue font-semibold hover:underline cursor-pointer"
                        onClick={() => handleViewClick(slot)}
                      >
                        {slot.name}
                      </td>
                      <td className="p-4">{slot.start_time}</td>
                      <td className="p-4">{slot.end_time}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            slot.shift === "Morning"
                              ? "table-status-morning"
                              : "table-status-day"
                          }`}
                        >
                          {slot.shift}
                        </span>
                      </td>
                      <td className="p-4">
                        <section className="flex justify-center gap-3">
                          <button
                            className="action-eye-btn"
                            onClick={() => handleViewClick(slot)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="action-edit-btn"
                            onClick={() => handleEditClick(slot)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-delete-btn"
                            onClick={() => handleConfirmDelete(slot)}
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
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className="mobile-card-container"
              >
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="mobile-card-badge">
                        TS-{String(slot.id).padStart(3, "0")}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          slot.shift === "Morning"
                            ? "table-status-morning"
                            : "table-status-day"
                        }`}
                      >
                        {slot.shift}
                      </span>
                    </div>
                    <h3
                      className="info-title-click"
                      onClick={() => handleViewClick(slot)}
                    >
                      {slot.name}
                    </h3>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <p className="info-label">Semester</p>
                    <p className="info-value">
                      {slot.semester?.semester_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="info-label">Batch</p>
                    <p className="info-value">
                      {slot.batch?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="info-label">Start Time</p>
                    <p className="text-sm font-medium text-main-blue">
                      {slot.start_time}
                    </p>
                  </div>
                  <div>
                    <p className="info-label">End Time</p>
                    <p className="text-sm font-medium text-main-blue">
                      {slot.end_time}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mobile-card-actions">
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleViewClick(slot)}
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    className="btn-mobile-secondary"
                    onClick={() => handleEditClick(slot)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="delete-mobile-btn"
                    onClick={() => handleConfirmDelete(slot)}
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
                  {Math.min(currentPage * pagination.per_page, pagination.total)}
                </span>{" "}
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

      <TimeSlotDetailDrawer
        isOpen={isViewSidebarOpen}
        onClose={closeModal}
        selectedSlot={selectedSlot}
        slotDetails={slotDetails}
        isLoadingDetails={isLoadingDetails}
      />

      <TimeSlotEditModal
        isOpen={isEditModalOpen}
        onClose={closeModal}
        selectedSlot={selectedSlot}
        slotDetails={slotDetails}
        isLoadingDetails={isLoadingDetails}
        onUpdateSuccess={() =>
          fetchTimeSlots(currentPage, {
            search: searchTerm?.trim() || null,
            shift: filterShift || null,
            is_active: filterStatus || null,
          })
        }
      />
    </div>
  );
};

export default TimeSlotList;