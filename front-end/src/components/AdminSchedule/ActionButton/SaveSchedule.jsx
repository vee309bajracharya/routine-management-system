/* eslint-disable no-unused-vars */
import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SaveSchedule = ({ isOpen, onClose }) => {
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
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Save Routine</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <div className="space-y-5">
              {/* Label Input */}
              <div>
                <label className="createSchedule-label">
                  Label
                </label>
                <input
                  type="text"
                  placeholder="Default"
                  className="createSchedule-option"
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="createSchedule-label">
                  Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Enter description..."
                  className="createSchedule-option"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button className="auth-btn w-full">Submit</button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default SaveSchedule;
