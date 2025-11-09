/* eslint-disable no-unused-vars */
import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // 👈 added this

const LoadSchedule = ({ isOpen, onClose }) => {
  const routines = [
    {
      date: "2025/01/12",
      label: "Default 1",
      description: "This is the first routine that I just made right now which is default",
    },
    {
      date: "2025/01/12",
      label: "Default 2",
      description: "This is the first routine that I just made right now which is default",
    },
    {
      date: "2025/01/12",
      label: "Default 3",
      description: "This is the first routine that I just made right now which is default",
    },
  ];

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
            {/* Header (Flex with title + close button) */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Load Routine</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X size={20} />
              </button>
            </div>

            {/* Table */}
            <div className="border border-none rounded-lg overflow-hidden mb-2">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-box-outline text-primary-text">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Label</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {routines.map((item, index) => (
                    <tr key={index} className="border-b border-box-outline last:border-0">
                      <td className="px-3 py-2 text-gray-800">{item.date}</td>
                      <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{item.label}</td>
                      <td className="px-3 py-2 text-gray-600">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div>
              <button className="auth-btn">Submit</button>
            </div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default LoadSchedule;
