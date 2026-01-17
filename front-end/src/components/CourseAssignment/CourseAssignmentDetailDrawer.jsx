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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="drawer-background"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="form-header">Assignment Details</h2>
              <button onClick={onClose} className="x-btn">
                <X size={20} />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
                <p className="text-sub-text text-sm">Loading details...</p>
              </div>
            ) : assignmentDetails ? (
              <>
                <div className="drawer-box-background p-5 mb-8">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={20} className="text-main-blue" />
                        <h3 className="drawer-info-header text-xl">
                          {assignmentDetails.course?.name || "N/A"}
                        </h3>
                      </div>
                      <p className="drawer-sub-title font-bold">
                        Code: {assignmentDetails.course?.code || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold ${
                        assignmentDetails.status === "active"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                          : assignmentDetails.status === "completed"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30"
                      }`}
                    >
                      ● {assignmentDetails.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <p className="drawer-sub-title">Assignment ID</p>
                      <p className="drawer-info-title text-sm">
                        COAS-{String(assignmentDetails.id).padStart(3, "0")}
                      </p>
                    </div>
                    <div>
                      <p className="drawer-sub-title">Type</p>
                      <p className="drawer-info-title text-sm">
                        {assignmentDetails.assignment_type}
                      </p>
                    </div>
                    <div>
                      <p className="drawer-sub-title">Created</p>
                      <p className="drawer-info-title text-sm">
                        {assignmentDetails.created_at || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-dashed border-gray-300 dark:border-gray-600">
                    <div>
                      <p className="drawer-sub-title">Department</p>
                      <p className="drawer-info-title text-sm">
                        {assignmentDetails.department?.code || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="drawer-sub-title">Semester</p>
                      <p className="drawer-info-title text-sm">
                        {assignmentDetails.semester?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="drawer-sub-title">Batch</p>
                      <p className="drawer-info-title text-sm">
                        {assignmentDetails.batch?.name || "N/A"}
                        {assignmentDetails.batch?.shift && (
                          <span className="text-xs text-sub-text ml-1">
                            ({assignmentDetails.batch.shift})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="drawer-info-header text-base mb-4">
                    Assigned Teacher
                  </h4>
                  <div className="flex items-center gap-4 p-4 border border-box-outline rounded-xl bg-white dark:bg-dark-hover">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-dark-overlay flex items-center justify-center text-main-blue flex-shrink-0">
                      <User size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="drawer-info-title text-base">
                        {assignmentDetails.teacher?.name || "N/A"}
                      </p>
                      <p className="text-xs text-sub-text font-medium mt-1">
                        Department:{" "}
                        {assignmentDetails.teacher?.department?.code || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="drawer-info-header text-base mb-4">Notes</h4>
                  <div className="w-full min-h-[120px] p-4 border border-box-outline rounded-xl bg-gray-50 dark:bg-dark-hover">
                    {assignmentDetails.notes && assignmentDetails.notes !== "N/A" ? (
                      <p className="text-primary-text dark:text-white text-sm leading-relaxed">
                        {assignmentDetails.notes}
                      </p>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm italic">
                          No additional notes provided
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-sub-text">No details available</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CourseAssignmentDetailDrawer;