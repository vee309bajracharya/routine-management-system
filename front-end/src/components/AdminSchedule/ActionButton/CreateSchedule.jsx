/* eslint-disable no-unused-vars */
import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // 👈 add this

const CreateSchedule = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="schedulebtn-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="bg-white rounded-xl w-[700px] p-6 shadow-xl relative font-general-sans"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Create Routine</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* --- CREATE SECTION --- */}
              <div>
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

              {/* --- TIMER SECTION --- */}
              <div>
                <h3 className="text-base font-semibold text-primary-text mb-3">
                  Timer
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Day Start */}
                  <div>
                    <label className="createSchedule-label">
                      Day Starting Time
                    </label>
                    <input type="time" className="createSchedule-option" />
                  </div>

                  {/* Start Break */}
                  <div>
                    <label className="createSchedule-label">
                      Starting Break Time
                    </label>
                    <input type="time" className="createSchedule-option" />
                  </div>

                  {/* Day End */}
                  <div>
                    <label className="createSchedule-label">Day End Time</label>
                    <input type="time" className="createSchedule-option" />
                  </div>

                  {/* End Break */}
                  <div>
                    <label className="createSchedule-label">
                      End Break Time
                    </label>
                    <input type="time" className="createSchedule-option" />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button type="submit" className="auth-btn">
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateSchedule;
