/* eslint-disable no-unused-vars */
import React from "react";
import { X } from "lucide-react";
import { AnimatePresence,motion } from "framer-motion";

const EditSchedule = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <section className="schedulebtn-popup">
          {/* Motion container for smooth fade/scale animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}   // before animation
            animate={{ opacity: 1, scale: 1, y: 0 }}      // animate in
            exit={{ opacity: 0, scale: 0.9, y: 30 }}       // animate out
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="bg-white rounded-xl w-[700px] p-6 shadow-xl relative font-general-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Edit Routine</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="createSchedule-label">Department</label>
                  <select className="createSchedule-option">
                    <option value="">Select Department</option>
                    <option>BCT</option>
                    <option>BEX</option>
                    <option>BEL</option>
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="createSchedule-label">Section</label>
                  <select className="createSchedule-option">
                    <option value="">Select Section</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label className="createSchedule-label">Course</label>
                  <select className="createSchedule-option">
                    <option value="">Select Course</option>
                    <option>Computer Network</option>
                    <option>Database System</option>
                    <option>Operating System</option>
                  </select>
                </div>

                {/* Room/Lab */}
                <div>
                  <label className="createSchedule-label">Room / Lab</label>
                  <select className="createSchedule-option">
                    <option value="">Select Room</option>
                    <option>B-301</option>
                    <option>B-407</option>
                    <option>Lab-2</option>
                  </select>
                </div>

                {/* Batch */}
                <div>
                  <label className="createSchedule-label">Batch</label>
                  <select className="createSchedule-option">
                    <option value="">Select Batch</option>
                    <option>077</option>
                    <option>078</option>
                    <option>079</option>
                  </select>
                </div>

                {/* Faculty */}
                <div>
                  <label className="createSchedule-label">Faculty</label>
                  <select className="createSchedule-option">
                    <option value="">Select Faculty</option>
                    <option>PP</option>
                    <option>SKT</option>
                    <option>KLM</option>
                  </select>
                </div>

                {/* Session Type */}
                <div className="col-span-2">
                  <label className="createSchedule-label">Session Type</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value="Lecture"
                        className="schedulesession-checkbox"
                      />
                      Lecture
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value="Practical"
                        className="schedulesession-checkbox"
                      />
                      Practical
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button type="submit" className="auth-btn">
                Submit
              </button>
            </div>
          </motion.div>
        </section>
      )}
    </AnimatePresence>
  );
};

export default EditSchedule;
