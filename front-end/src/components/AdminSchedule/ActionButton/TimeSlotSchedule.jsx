/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // 👈 added this

const TimeSlotSchedule = ({ isOpen, onClose, onSubmit }) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:45");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ startTime, endTime });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.section
          className="schedulebtn-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="bg-white rounded-xl w-[500px] p-6 shadow-xl relative font-general-sans"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Edit Period Time Slot</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Start Time */}
              <div>
                <label className="createSchedule-label">Day Starting Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="createSchedule-option"
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <label className="createSchedule-label">Day End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="createSchedule-option"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button type="submit" className="auth-btn">
                  Submit
                </button>
              </div>
            </form>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default TimeSlotSchedule;
