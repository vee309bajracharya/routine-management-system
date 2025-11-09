/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DateDurationSchedule = ({ isOpen, onClose, onSubmit }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ startDate, endDate });
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
            className="bg-white rounded-xl w-[407px] shadow-xl relative font-general-sans"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="schedulepopup-title">Routine Valid Till</h2>
              <button
                onClick={onClose}
                className="scheduleClose-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
              {/* Start Date */}
              <div>
                <label className="createSchedule-label">
                  Starting Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="createSchedule-option"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="createSchedule-label">
                  Ending Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="createSchedule-option"
                />
              </div>

              {/* Note */}
              <p className="text-xs text-sub-text pt-1">
                Note: Notification will be sent of expiration of routine before
                10 days
              </p>

              {/* Submit */}
              <button type="submit" className="auth-btn">
                Submit
              </button>
            </form>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default DateDurationSchedule;
