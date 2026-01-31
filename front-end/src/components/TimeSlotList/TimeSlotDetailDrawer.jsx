/* eslint-disable no-unused-vars */
import React from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TimeSlotDetailDrawer = ({
  isOpen,
  onClose,
  selectedSlot,
  slotDetails,
  isLoadingDetails,
}) => {
  if (!selectedSlot) return null;

  const days = [
    { value: "Sunday", label: "Sun" },
    { value: "Monday", label: "Mon" },
    { value: "Tuesday", label: "Tue" },
    { value: "Wednesday", label: "Wed" },
    { value: "Thursday", label: "Thu" },
    { value: "Friday", label: "Fri" },
  ];

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
                  View Time-slot Details
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
                  <Loader2
                    size={40}
                    className="animate-spin text-main-blue mb-3"
                  />
                  <p className="state-loading">Loading details...</p>
                </div>
              ) : slotDetails ? (
                <>
                  {/* Top Info Box */}
                  <div className="bg-gray-50 dark:bg-dark-hover p-4 sm:p-5 rounded-xl border border-box-outline">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-text dark:text-white break-words">
                      {slotDetails.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-main-blue font-medium mt-1">
                      TS-{String(slotDetails.id).padStart(3, "0")}
                    </p>
                    <div className="flex mt-3 items-center justify-between flex-wrap gap-2">
                      {/* Shift and Slot Type */}
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`drawer-status-indicator ${
                            slotDetails.shift === "Morning"
                              ? "drawer-status-morning"
                              : "drawer-status-day"
                          }`}
                        >
                          {slotDetails.shift} Shift
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-main-gray dark:bg-dark-hover text-primary-text dark:text-white whitespace-nowrap">
                          {slotDetails.slot_type}
                        </span>
                      </div>

                      {/* Active/Inactive */}
                      <span
                        className={`drawer-status-indicator ${
                          slotDetails.is_active
                            ? "drawer-status-active"
                            : "drawer-status-inactive"
                        }`}
                      >
                        {slotDetails.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div>
                    <h4 className="drawer-section-title">Timeslot Information</h4>
                    <div className="drawer-info-grid">
                      <div>
                        <p className="grid-label">Department</p>
                        <p className="grid-value">{slotDetails.department?.code || "N/A"}</p>
                      </div>
                      <div>
                        <p className="grid-label">Semester</p>
                        <p className="grid-value">{slotDetails.semester?.semester_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="grid-label">Batch</p>
                        <p className="grid-value">{slotDetails.batch?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="grid-label">Duration</p>
                        <p className="grid-value">{slotDetails.duration_minutes} Minutes</p>
                      </div>
                      <div>
                        <p className="grid-label">Start Time</p>
                        <p className="grid-value">{slotDetails.start_time}</p>
                      </div>
                      <div>
                        <p className="grid-label">End Time</p>
                        <p className="grid-value">{slotDetails.end_time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Applicable Days */}
                  <div>
                    <h4 className="drawer-section-title">
                      Applicable Days
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {days.map((day) => {
                        const isApplicable =
                          slotDetails.applicable_days &&
                          slotDetails.applicable_days.includes(day.value);
                        return (
                          <span
                            key={day.value}
                            className={`px-3 sm:px-4 py-1.5 rounded text-xs font-semibold whitespace-nowrap ${
                              isApplicable
                                ? "bg-main-blue text-white shadow-sm"
                                : "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                            }`}
                          >
                            {day.label}
                          </span>
                        );
                      })}
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

export default TimeSlotDetailDrawer;