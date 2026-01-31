/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Users, Loader2 } from "lucide-react";

const CourseDetailDrawer = ({
  isOpen,
  onClose,
  course,
  details,
  isLoading,
}) => {
  return (
    <AnimatePresence>
      {isOpen && course && (
        <motion.div
          className="fixed inset-0 z-50 font-general-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            className="drawer-container"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Sticky Header */}
            <div className="drawer-sticky-header">
              <div className="flex justify-between items-center">
                <h2 className="drawer-title">
                  Course Details
                </h2>
                <button onClick={onClose} className="x-btn p-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="state-container">
                <Loader2 size={40} className="animate-spin text-main-blue mb-3"/>
                <p className="state-loading">Loading details...</p>
              </div>
            ) : details ? (
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-24">
                {/* Course Header */}
                <div className="flex items-start gap-3">
                  <div className="drawer-avatar-box">
                    <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-main-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="drawer-header-title">
                      {details.course_name}
                    </h3>
                    <div className="flex items-center justify-between w-full mt-2 gap-2">
                      {/* Left side items */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-xs sm:text-xs uppercase text-sub-text dark:text-sub-text font-semibold">
                          Code: {details.code}
                        </span>
                        <span className="text-xs sm:text-xs bg-main-blue text-white px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                          {details.course_type}
                        </span>
                      </div>

                      {/* Right side item */}
                      <span
                        className={`text-xs sm:text-xs px-2 py-0.5 sm:py-1 rounded capitalize whitespace-nowrap ${
                          details.status === "active"
                            ? "drawer-status-active"
                            : "drawer-status-inactive"
                        }`}
                      >
                        {details.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div>
                  <h4 className="drawer-section-title">
                    Course Information
                  </h4>
                  <div className="bg-hover-gray dark:bg-dark-hover p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-box-outline space-y-3">
                    {/* Description */}
                    <div className="flex flex-col gap-2 pt-1">
                      <span className="drawer-box-title ">
                        Description
                      </span>
                      <span className="text-xs sm:text-sm md:text-base text-primary-text dark:text-white leading-relaxed ">
                        {details.description || "No description provided"}
                      </span>
                    </div>

                    {/* Department */}
                    <div className="flex justify-between items-center pb-3 border-b border-main-gray dark:border-sub-text">
                      <span className="drawer-box-title">
                        Department
                      </span>
                      <span className="drawer-box-subtext">
                        {details.department?.code || "N/A"}
                      </span>
                    </div>

                    {/* Academic Year */}
                    <div className="flex justify-between items-center pb-3 border-b border-main-gray dark:border-sub-text">
                      <span className="drawer-box-title">
                        Academic Year
                      </span>
                      <span className="drawer-box-subtext">
                        {details.academic_year?.name || "N/A"}
                      </span>
                    </div>

                    {/* Semester */}
                    <div className="flex justify-between items-center pb-3 ">
                      <span className="drawer-box-title">
                        Semester
                      </span>
                      <span className="drawer-box-subtext">
                        {details.semester?.name || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Assignments */}
                <div>
                  <h4 className="drawer-section-title">
                    Course Assignments
                  </h4>
                  {details.course_assignments?.length > 0 ? (
                    <>
                      {/* Mobile Card View */}
                      <div className="block sm:hidden space-y-3">
                        {details.course_assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="bg-hover-gray dark:bg-dark-hover p-3 rounded-lg border border-box-outline space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="info-label uppercase">
                                  Teacher
                                </p>
                                <p className="text-sm font-semibold text-primary-text dark:text-white truncate">
                                  {assignment.teacher?.name || "N/A"}
                                </p>
                              </div>
                              <span
                                className={`drawer-status-indicator ml-2 ${
                                  assignment.batch?.shift === "Morning"
                                    ? "drawer-status-morning"
                                    : "drawer-status-day"
                                }`}
                              >
                                {assignment.batch?.shift || "N/A"}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-main-gray dark:border-sub-text">
                              <p className="info-label uppercase">
                                Batch
                              </p>
                              <p className="text-sm font-medium text-main-blue">
                                {assignment.batch?.name || "N/A"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto rounded-lg border border-box-outline">
                        <table className="min-w-full">
                          <thead className="table-thead">
                            <tr>
                              <th className="drawer-table-th">Teacher</th>
                              <th className="drawer-table-th">Batch</th>
                              <th className="drawer-table-th">Shift</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-box-outline">
                            {details.course_assignments.map((assignment) => (
                              <tr
                                key={assignment.id}
                                className="hover:bg-hover-gray dark:hover:bg-dark-hover transition-colors"
                              >
                                <td className="p-3 md:p-4 text-xs md:text-sm text-primary-text dark:text-white font-semibold">
                                  {assignment.teacher?.name || "N/A"}
                                </td>
                                <td className="p-3 md:p-4 text-xs md:text-sm text-main-blue font-medium">
                                  {assignment.batch?.name || "N/A"}
                                </td>
                                <td className="p-3 md:p-4">
                                  <span
                                    className={`px-2 md:px-3 py-1 rounded text-xs whitespace-nowrap ${
                                      assignment.batch?.shift === "Morning"
                                        ? "drawer-status-morning"
                                        : "drawer-status-day"
                                    }`}
                                  >
                                    {assignment.batch?.shift || "N/A"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 sm:p-8 bg-hover-gray dark:bg-dark-hover rounded-lg text-center">
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-sub-text mb-2" />
                      <p className="text-xs sm:text-sm text-sub-text">
                        No assignments for this course yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseDetailDrawer;
