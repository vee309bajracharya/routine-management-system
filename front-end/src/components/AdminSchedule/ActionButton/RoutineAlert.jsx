/* eslint-disable no-unused-vars */
import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RoutineAlert = ({ isOpen, onClose, onContinue }) => {
    
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
            className="bg-white rounded-xl w-[450px] p-6 shadow-xl relative font-general-sans"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h2 className="schedulepopup-title">
                  ALERT:
                </h2>
              </div>

              <button onClick={onClose} className="scheduleClose-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message */}
            <p className="text-primary-text text-sm leading-relaxed pl-1">
              "Changing department will reset selections. Continue?"
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="overview-btn"
              >
                Cancel
              </button>

              <button
                onClick={onContinue}
                className="auth-btn"
              >
                Continue
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoutineAlert;
