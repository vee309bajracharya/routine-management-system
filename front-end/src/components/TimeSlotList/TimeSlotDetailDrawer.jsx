/* eslint-disable no-unused-vars */
import React from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TimeSlotDetailDrawer = ({ isOpen, onClose, selectedSlot, slotDetails, isLoadingDetails }) => {
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
              <h2 className="form-header">View Time-slot Details</h2>
              <button onClick={onClose} className="x-btn">
                <X size={20} />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
                <p className="text-sub-text text-sm">Loading details...</p>
              </div>
            ) : slotDetails ? (
              <>
                <div className="drawer-box-background p-5 mb-8">
                  <h3 className="drawer-info-header text-xl mb-1">
                    {slotDetails.name}
                  </h3>
                  <p className="drawer-sub-title font-bold">
                    TS-{String(slotDetails.id).padStart(3, "0")}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        slotDetails.shift === "Morning"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {slotDetails.shift}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-dark-hover text-primary-text dark:text-white">
                      {slotDetails.slot_type}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        slotDetails.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {slotDetails.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="drawer-info-header text-base mb-4">
                    Timeslot Information
                  </h4>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 p-5 border border-box-outline rounded-xl bg-white dark:bg-dark-hover">
                    <div>
                      <p className="drawer-sub-title">Department</p>
                      <p className="drawer-info-title text-sm">
                        {slotDetails.department?.code || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="drawer-sub-title">Semester</p>
                      <p className="drawer-info-title text-sm">
                        {slotDetails.semester?.semester_name || "N/A"}
                      </p>
                    </div>
                    <div className=" border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="drawer-sub-title">Batch</p>
                      <p className="drawer-info-title text-sm">
                        {slotDetails.batch?.name || "N/A"}
                        {slotDetails.batch?.shift && (
                          <span className="text-xs text-sub-text ml-2">
                            ({slotDetails.batch.shift} Shift)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="drawer-sub-title">Duration</p>
                      <p className="drawer-info-title text-sm">
                        {slotDetails.duration_minutes} Minutes
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="drawer-sub-title">Start Time</p>
                      <p className="drawer-info-title text-sm">
                        {slotDetails.start_time}
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="drawer-sub-title">End Time</p>
                      <p className="drawer-info-title text-sm">
                        {slotDetails.end_time}
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="drawer-sub-title">Shift</p>
                      <p className="drawer-info-title text-sm">
                        {slotDetails?.batch?.shift || "N/A"}
                      </p>
                    </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="drawer-sub-title">Type</p>
                      <p className="drawer-info-title text-sm">
                        {slotDetails.slot_type}
                      </p>
                    </div>
                    
                  </div>
                </div>

                <div className="px-2 mt-8">
                  <h4 className="drawer-info-header text-base mb-4">
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
                          className={`px-4 py-1.5 rounded text-xs font-semibold ${
                            isApplicable
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                              : "bg-gray-50 text-gray-400 dark:bg-gray-800"
                          }`}
                        >
                          {day.label}
                        </span>
                      );
                    })}
                  </div>
                  {slotDetails.applicable_days &&
                    slotDetails.applicable_days.length === 6 && (
                      <p className="text-xs text-sub-text mt-2">
                        All working days selected
                      </p>
                    )}
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

export default TimeSlotDetailDrawer;