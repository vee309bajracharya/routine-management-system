/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CreateRoutineFormModal = ({ isOpen, onClose }) => {
  const [routineTitle, setRoutineTitle] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ routineTitle, routineDescription, effectiveFrom, effectiveTo });
    
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
            className="bg-white rounded-xl w-full max-w-xl p-6 shadow-xl relative"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Create Routine</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="createSchedule-label">Routine Title</label>
                  <input
                    type="text"
                    value={routineTitle}
                    onChange={(e) => setRoutineTitle(e.target.value)}
                    className="createSchedule-option"
                    required
                  />
                </div>

                <div>
                  <label className="createSchedule-label">Routine Description</label>
                  <input
                    type="text"
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                    className="createSchedule-option"
                    required
                  />
                </div>

                <div>
                  <label className="createSchedule-label">Effective From</label>
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="createSchedule-option"
                    required
                  />
                </div>

                <div>
                  <label className="createSchedule-label">Effective To</label>
                  <input
                    type="date"
                    value={effectiveTo}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                    className="createSchedule-option"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-btn w-full"
              >
                Submit
              </button>
            </form>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default CreateRoutineFormModal;
