/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {X, User, Phone, Mail, Calendar, Edit3, FlaskConical, Box, Building2,} from "lucide-react";

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
          className="absolute inset-0"
          onClick={closeDrawer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Drawer */}
        <motion.div
          className="fixed right-0 top-0 h-full w-[600px] bg-white dark:bg-dark-overlay shadow-2xl overflow-y-auto"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-dark-overlay p-6 border-b border-box-outline z-10">
            <div className="flex justify-between items-center">
              <h2 className="form-header">Faculty Details</h2>
              <motion.button
                onClick={closeDrawer}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-primary-text dark:text-white" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 pb-24">
            {/* Profile Header */}
            <motion.div
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-15 h-15 bg-box-outline  rounded-full flex-shrink-0 flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-primary-text dark:text-white">
                  {selectedUser.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-gray-100 dark:bg-dark-hover text-primary-text dark:text-white px-2 py-1 rounded">
                    ID: FAC-{String(selectedUser.id).padStart(4, "0")}
                  </span>
                  <span className="text-xs bg-main-blue text-white px-2 py-1 rounded capitalize">
                    {selectedUser.role}
                  </span>
                  {isTeacher && teacherInfo?.employment_type && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {teacherInfo.employment_type}
                    </span>
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
              <h4 className="text-lg font-semibold text-primary-text dark:text-white mb-3">
                Contact Information
              </h4>
              <div className="">
                <div className="flex items-center gap-2 p-3  dark:bg-dark-hover rounded-md">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-main-blue" />
                  </div>
                  <div>
                    <div className="text-xs text-sub-text mb-0.5">Phone</div>
                    <div className="text-sm font-medium text-primary-text dark:text-white">
                      {selectedUser.phone || "Not provided"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3  dark:bg-dark-hover rounded-md">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-main-blue" />
                  </div>
                  <div>
                    <div className="text-xs text-sub-text mb-0.5">Email</div>
                    <div className="text-sm font-medium text-primary-text dark:text-white break-all">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>

                {isTeacher && teacherInfo?.department && (
                  <div className="flex items-center gap-2 p-3  dark:bg-dark-hover rounded-md">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} className="text-main-blue" />
                    </div>
                    <div>
                      <div className="text-xs text-sub-text mb-0.5">
                        Department
                      </div>
                      <div className="text-sm font-medium text-primary-text dark:text-white">
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
                <h4 className="text-lg font-semibold text-primary-text dark:text-white mb-2">
                  Schedule Availability
                </h4>
                <p className="text-xs text-sub-text mb-3">
                  Current teaching schedule and class assignments
                </p>

                {schedule.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-box-outline">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-dark-hover">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-primary-text dark:text-white">
                            Day
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-primary-text dark:text-white">
                            Batch
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-primary-text dark:text-white">
                            Course
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-primary-text dark:text-white">
                            Time
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-primary-text dark:text-white">
                            Room
                          </th>
                        </tr>
                      </thead>
                      
                      <tbody className="divide-y divide-box-outline">
                        {schedule.map((slot, index) => (
                          <motion.tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-dark-hover"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <td className="px-3 py-2 text-sm text-primary-text dark:text-white">
                              {slot.day}
                            </td>
                            <td className="px-3 py-2 text-sm text-primary-text dark:text-white">
                              <div className="flex flex-col">
                                <span>{slot.batch?.name || "N/A"}</span>
                                <span className="text-xs text-sub-text">
                                  {slot.batch?.shift}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-primary-text dark:text-white">
                              {slot.course?.name || "N/A"}
                            </td>
                            <td className="px-3 py-2 text-sm text-primary-text dark:text-white">
                              {slot.time_slot?.display_label || "N/A"}
                            </td>
                            <td className="px-3 py-2 text-sm text-primary-text dark:text-white">
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
                ) : (
                  <div className="p-6 bg-gray-50 dark:bg-dark-hover rounded-lg text-center">
                    <Calendar
                      size={32}
                      className="mx-auto text-sub-text mb-2"
                    />
                    <p className="text-sm text-sub-text">
                      No schedule assigned yet
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Action Buttons (Fixed at bottom) */}
          <motion.div
            className="sticky bottom-0 bg-white dark:bg-dark-overlay p-6 border-t border-box-outline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex gap-3">
              <button
                onClick={handleEditClick}
                className="flex-1 flex items-center justify-center gap-2 bg-main-blue text-white px-4 py-2.5 rounded-lg hover:bg-hover-blue transition-colors"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FacultyDetailsDrawer;
