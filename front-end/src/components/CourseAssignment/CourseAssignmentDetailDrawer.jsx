/* eslint-disable no-unused-vars */
import React from "react";
import { X, User, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CourseAssignmentDetailDrawer = ({
  isOpen,
  onClose,
  selectedAssignment,
  assignmentDetails,
  isLoadingDetails,
}) => {
  if (!selectedAssignment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 font-general-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Drawer Container */}
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
                  View Course Assignment Details
                </h2>
                <button onClick={onClose} className="x-btn p-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-24">
              {isLoadingDetails ? (
                <div className="state-container">
                  <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
                  <p className="state-loading">Loading details...</p>
                </div>
              ) : assignmentDetails ? (
                <>
                  {/* Top Info Box */}
                  <div className="bg-hover-gray dark:bg-dark-hover p-4 sm:p-5 rounded-xl border border-box-outline">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={18} className="text-main-blue flex-shrink-0" />
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-text dark:text-white break-words">
                        {assignmentDetails.course?.name || "N/A"}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-main-blue font-medium mb-3">
                      COURSE CODE: COAS-{String(assignmentDetails.id).padStart(3, "0")}
                    </p>
                    <div className="flex gap-2 flex-wrap justify-between items-center">
                      <span className="px-2 py-1 rounded text-xs bg-main-gray dark:bg-dark-hover text-primary-text dark:text-white whitespace-nowrap">
                        {assignmentDetails.assignment_type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          assignmentDetails.status === "active"
                            ? "drawer-status-active"
                            : "drawer-status-inactive"
                        }`}
                      >
                        ● {assignmentDetails.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div>
                    <h4 className="drawer-section-title">
                      Assignment Information
                    </h4>
                    <div className="drawer-info-grid">
                      <div>
                        <p className="grid-label">
                          Course Code
                        </p>
                        <p className="grid-value">
                          {assignmentDetails.course?.code || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="grid-label">
                          Department
                        </p>
                        <p className="grid-value">
                          {assignmentDetails.department?.code || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="grid-label">
                          Semester
                        </p>
                        <p className="grid-value">
                          {assignmentDetails.semester?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="grid-label">
                          Batch
                        </p>
                        <p className="grid-value">
                          {assignmentDetails.batch?.name || "N/A"}{" "}
                          <span className="text-xs text-sub-text">
                            ({assignmentDetails.batch?.shift || "N/A"})
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Teacher Section */}
                  <div>
                    <h4 className="drawer-section-title">
                      Assigned Teacher
                    </h4>
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-box-outline rounded-xl bg-white dark:bg-dark-hover">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-dark-overlay rounded-md flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-main-blue sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="grid-value truncate">
                          {assignmentDetails.teacher?.name || "N/A"}
                        </p>
                        <p className="text-xs sm:text-sm text-sub-text mt-1 uppercase">
                          {assignmentDetails.teacher?.department?.code || "N/A"} Department
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div>
                    <h4 className="drawer-section-title">
                      Notes
                    </h4>
                    <div className="w-full min-h-[100px] p-3 sm:p-4 border border-box-outline rounded-xl bg-hover-gray dark:bg-dark-hover">
                      {assignmentDetails.notes && assignmentDetails.notes !== "N/A" ? (
                        <p className="text-primary-text dark:text-white text-xs sm:text-sm leading-relaxed">
                          {assignmentDetails.notes}
                        </p>
                      ) : (
                        <div className="flex items-center justify-center h-full py-4">
                          <p className="text-sub-text text-xs sm:text-sm italic">
                            No additional notes provided
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state-wrapper">
                  <p className="text-sub-text">No details available</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseAssignmentDetailDrawer;