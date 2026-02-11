/* eslint-disable no-unused-vars */
import TeacherAvailabilityDetailDrawer from "../../../../components/TeacherAvailabilityList/TeacherAvailabilityDetailDrawer";
import TeacherAvailabilityEditModal from "../../../../components/TeacherAvailabilityList/TeacherAvailabilityEditModal";
import axiosClient from "../../../../services/api/axiosClient";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TeacherAvailabilityList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);

  // Debounce hook
  const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
  };
  const debouncedSearch = useDebounce(searchTerm, 450);

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
      toast.error(error.userMessage || "Failed to fetch teacher availability");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTeacherDetails = async (teacherId) => {
    try {
      const params = { page: currentPage, search: searchTerm?.trim() || null };
      const response = await axiosClient.get("/admin/teacher-availability", {
        params,
      });
      if (response.data.success) {
        setTeachers(response.data.data || []);
        setPagination(response.data.pagination || null);

        // Update the selected teacher in the drawer with fresh data
        const updatedTeacher = response.data.data.find(
          (t) => t.teacher_id === teacherId,
        );
        if (updatedTeacher && isViewDrawerOpen) {
          setSelectedTeacher(updatedTeacher);
        }
      }
    } catch (error) {
      toast.error(error.userMessage || "Failed to refresh data");
    }
  };

  useEffect(() => {
    fetchTeachers(currentPage, { search: debouncedSearch?.trim() || null });
  }, [currentPage, debouncedSearch, fetchTeachers]);

  const loadPage = (page) => {
    setCurrentPage(page);
  };

  const deleteAvailability = async (id) => {
    try {
      const response = await axiosClient.delete(`/admin/teacher-availability/${id}`);
      if (response.data.success) {
        toast.success("Deleted successfully");
        fetchTeachers(currentPage, { search: searchTerm });
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleConfirmDelete = (availability, teacherName) => {
    toast(
      ({ closeToast }) => (
        <div className="font-general-sans text-sm">
          <p className="font-semibold text-error-red mb-1">
            Delete Teacher Availability?
          </p>
          <p className="text-sub-text mb-3">
            Remove <span className="font-semibold">{teacherName}</span>'s slot on <span className="font-semibold">{availability.day_of_week}</span>?
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={closeToast} className="toast-cancel">
              Cancel
            </button>
            <button
              onClick={() => {
                closeToast();
                deleteAvailability(availability.id);
              }}
              className="toast-delete"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeButton: false },
    );
  };

  const handleEditClick = (availability, teacher) => {
    setSelectedAvailability(availability);
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDrawerOpen(true);
  };

  return (
    <div className="academic-common-bg">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="form-header text-xl md:text-2xl font-bold">
          Teacher Availability
        </h1>
        <p className="form-subtext text-sm">
          Manage weekly time slots and availability for faculty members.
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-sm">
          <span className="search-icon">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Teacher Name"
            className="search-btn"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            id="search"
            autoComplete="off"
          />
        </div>
        <button
          onClick={() =>
            navigate("/admin/academic-structure/teacher-availability")
          }
          className="btn-link justify-center font-medium"
        >
          <Plus size={16} /> Add Teacher Availability
        </button>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="state-container">
          <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
          <p className="state-loading">Loading Teacher Availability</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="state-empty-bg">
          <p className="state-text">No teachers found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-thead">
                  <tr>
                    <th className="table-th">Teacher ID</th>
                    <th className="table-th">Teacher Name</th>
                    <th className="table-th">Available Time Range</th>
                    <th className="table-th">Total Available Slots</th>
                    <th className="table-th text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-box-outline">
                  {teachers.map((teacher) => (
                    <tr key={teacher.teacher_id} className="table-tbody-tr">
                      <td className="p-4">
                        T-{String(teacher.teacher_id).padStart(4, "0")}
                      </td>
                      <td
                        className="p-4 text-main-blue font-semibold hover:underline cursor-pointer"
                        onClick={() => handleViewClick(teacher)}
                      >
                        {teacher.teacher_name}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-nowrap gap-3 overflow-x-auto max-w-4xl no-scrollbar py-2">
                          {teacher?.schedule && teacher.schedule.length > 0 ? (
                            <>
                              {/* four data showing */}
                              {teacher.schedule.slice(0, 3).map((slot) => (
                                <div
                                  key={slot.id}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-hover-gray border border-box-outline dark:bg-dark-overlay dark:border-sub-text whitespace-nowrap shadow-sm hover:border-main-blue transition-colors"
                                >
                                  {/* Day Label */}
                                  <span className="font-bold text-xs text-main-blue border-r border-box-outline pr-2 uppercase">
                                    {slot.day_of_week.substring(0, 3)}
                                  </span>
                                  {/* Time Range */}
                                  <span className="text-xs text-primary-text dark:text-white font-medium">
                                    {slot.available_from} - {slot.available_to}
                                  </span>
                                </div>
                              ))}

                              {/* More than 4 show count */}
                              {teacher.schedule.length > 4 && (
                                <span className="text-xs text-sub-text self-center whitespace-nowrap">
                                  + {teacher.schedule.length - 4} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No schedule added
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{teacher.availability_count}</td>
                      <td className="p-4 text-center">
                        <button
                          className="text-main-blue flex items-center justify-center gap-1 text-xs font-bold mx-auto cursor-pointer"
                          onClick={() => handleViewClick(teacher)}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-card-list">
            {teachers.map((teacher) => (
              <div key={teacher.teacher_id} className="mobile-card-container">
                {/* Header Row */}
                <div className="mobile-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="info-label">
                        T-{String(teacher.teacher_id).padStart(4, "0")}
                      </span>
                      <span className="mobile-card-badge">
                        {teacher.availability_count} Slot
                        {teacher.availability_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <h3
                      className="info-title-click"
                      onClick={() => handleViewClick(teacher)}
                    >
                      {teacher.teacher_name}
                    </h3>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="pt-2">
                  <p className="text-xs text-sub-text mb-2">Time Slots</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.schedule?.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="text-xs p-1.5 bg-hover-gray dark:bg-dark-hover border border-box-outline rounded text-primary-text dark:text-white"
                      >
                        {s.day_of_week.substring(0, 3)}: {s.available_from}-
                        {s.available_to}
                      </span>
                    ))}
                    {teacher.availability_count > 3 && (
                      <span className="text-xs text-sub-text self-center">
                        +{teacher.availability_count - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    className="view-details"
                    onClick={() => handleViewClick(teacher)}
                  >
                    <Eye size={16} /> View Details
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
                    className={`px-3 py-1.5 rounded-md text-sm ${page === currentPage
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

      {/* Modular Components */}
      <TeacherAvailabilityDetailDrawer
        isOpen={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        teacher={selectedTeacher}
        onEditClick={handleEditClick}
        onDeleteClick={handleConfirmDelete}
      />

      <TeacherAvailabilityEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAvailability(null);
        }}
        availability={selectedAvailability}
        teacher={selectedTeacher}
        onSuccess={() => refreshTeacherDetails(selectedTeacher?.teacher_id)}
      />
    </div>
  );
};

export default TeacherAvailabilityList;
