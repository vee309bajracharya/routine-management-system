/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {X, User, Phone, Mail, Calendar, Edit, FlaskConical, Box, Building2,} from "lucide-react";

const FacultyDetailsDrawer = ({ selectedUser, closeDrawer, openEditModal }) => {
  if (!selectedUser) return null;

  const isTeacher = selectedUser.role === "teacher";
  const teacherInfo = selectedUser.teacher_info;
  const schedule = teacherInfo?.schedule_availability || [];

  const getRoomIcon = (room) => {
    const roomType = room?.room_type?.toLowerCase() || "";
    return roomType.includes("lab") ? (
      <FlaskConical size={16} className="text-main-blue" />
    ) : (
      <Box size={16} className="text-main-blue" />
    );
  };

  const handleEditClick = () => {
    openEditModal(selectedUser);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 font-general-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50"
          onClick={closeDrawer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Drawer */}
        <motion.div
          className="drawer-container"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Header */}
          <div className="drawer-sticky-header">
            <div className="flex justify-between items-center">
              <h2 className="drawer-title">Faculty Details</h2>
              <motion.button
                onClick={closeDrawer}
                className="x-btn p-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24 sm:pb-28">
            {/* Profile Header */}
            <motion.div
              className="flex items-start gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-12 h-12 sm:w-15 sm:h-15 bg-box-outline rounded-full flex-shrink-0 flex items-center justify-center">
                <User size={24} className="text-white sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-primary-text dark:text-white break-words">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-main-gray dark:bg-dark-hover text-primary-text dark:text-white px-2 py-1 rounded">ID: FAC-{String(selectedUser.id).padStart(4, "0")}</span>
                  <span className="text-xs bg-main-blue text-white px-2 py-1 rounded capitalize">{selectedUser.role}</span>
                  {isTeacher && teacherInfo?.employment_type && (
                    <span className="text-xs bg-green-100 text-success-green px-2 py-1 rounded">{teacherInfo.employment_type}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h4 className="drawer-info-header text-base sm:text-lg">
                Contact Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-3 p-3 dark:bg-dark-hover rounded-md">
                  <div className="drawer-icon-box w-8 h-8 sm:w-10 sm:h-10">
                    <Phone size={16} className="text-main-blue sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="drawer-sub-title text-xs">Phone</div>
                    <div className="drawer-info-title text-sm sm:text-base">
                      {selectedUser.phone || "Not provided"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-3 dark:bg-dark-hover rounded-md">
                  <div className="drawer-icon-box w-8 h-8 sm:w-10 sm:h-10">
                    <Mail size={16} className="text-main-blue sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="drawer-sub-title text-xs">Email</div>
                    <div className="drawer-info-title text-sm sm:text-base break-all">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>

                {isTeacher && teacherInfo?.department && (
                  <div className="flex items-center gap-2 sm:gap-3 p-3 dark:bg-dark-hover rounded-md">
                    <div className="drawer-icon-box w-8 h-8 sm:w-10 sm:h-10">
                      <Building2 size={16} className="text-main-blue sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="drawer-sub-title text-xs">
                        Department
                      </div>
                      <div className="drawer-info-title text-sm sm:text-base">
                        {teacherInfo.department.name} (
                        {teacherInfo.department.code})
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Schedule Availability (Teachers only) */}
            {isTeacher && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h4 className="drawer-info-header text-base sm:text-lg">
                  Schedule Availability
                </h4>
                <p className="text-xs text-sub-text mb-3">
                  Current teaching schedule and class assignments
                </p>

                {schedule.length > 0 ? (
                  <>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-3">
                      {schedule.map((slot, index) => (
                        <motion.div
                          key={index}
                          className="bg-gray-50 dark:bg-dark-hover p-3 rounded-lg border border-box-outline space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="info-label">Day</p>
                              <p className="info-value">{slot.day}</p>
                            </div>
                            <div className="text-right">
                              <p className="info-label">Time</p>
                              <p className="info-value">{slot.time_slot?.display_label || "N/A"}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-main-gray dark:border-sub-text">
                            <p className="info-label">Batch</p>
                            <p className="text-sm font-medium text-main-blue">{slot.batch?.name || "N/A"}</p>
                            <p className="text-xs text-sub-text">{slot.batch?.shift}</p>
                          </div>
                          <div className="pt-2 border-t border-main-gray dark:border-sub-text">
                            <p className="info-label">Course</p>
                            <p className="info-value">{slot.course?.name || "N/A"}</p>
                          </div>
                          <div className="pt-2 border-t border-main-gray dark:border-sub-text flex items-center gap-2">
                            <p className="text-xs text-sub-text">Room:</p>
                            {getRoomIcon(slot.room)}
                            <span className="info-value">{slot.room?.room_number || "N/A"}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Tablet/Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto rounded-lg border border-box-outline">
                      <table className="min-w-full">
                        <thead className="table-thead">
                          <tr>
                            <th className="table-th">Day</th>
                            <th className="table-th">Batch</th>
                            <th className="table-th">Course</th>
                            <th className="table-th">Time</th>
                            <th className="table-th">Room</th>
                          </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-box-outline">
                          {schedule.map((slot, index) => (
                            <motion.tr
                              key={index}
                              className="table-tbody-tr"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <td className="p-3 text-xs sm:text-sm">{slot.day}</td>
                              <td className="px-3 text-xs sm:text-sm">
                                <div className="flex flex-col">
                                  <span>{slot.batch?.name || "N/A"}</span>
                                  <span className="text-xs text-sub-text">{slot.batch?.shift}</span>
                                </div>
                              </td>
                              <td className="px-3 text-xs sm:text-sm">{slot.course?.name || "N/A"}</td>
                              <td className="px-3 text-xs sm:text-sm">{slot.time_slot?.display_label || "N/A"}</td>
                              <td className="px-3 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  {getRoomIcon(slot.room)}
                                  <span>{slot.room?.room_number || "N/A"}</span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-hover-gray dark:bg-dark-hover rounded-lg text-center">
                    <Calendar
                      size={32}
                      className="mx-auto text-sub-text mb-2"
                    />
                    <p className="form-subtext">No schedule assigned yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            className="drawer-footer-sticky"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex gap-3">
              <button
                onClick={handleEditClick}
                className="drawer-edit-btn"
              >
                <Edit size={16} /> Edit Profile
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FacultyDetailsDrawer;