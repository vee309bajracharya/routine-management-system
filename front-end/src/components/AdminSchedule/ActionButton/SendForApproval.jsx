/* eslint-disable no-unused-vars */
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SendForApproval = ({ isOpen, onClose }) => {
  const facultyList = [
    { name: "John Doe", email: "johnny123@gmail.com" },
    { name: "John Doe", email: "johnnyxx@gmail.com" },
    { name: "John Doe", email: "johnny2@gmail.com" },
  ];

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
              <h2 className="schedulepopup-title">Send for Approval</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-primary-text text-sm leading-relaxed pl-1 mb-4">
              Select the faculty to review and approve this routine.
            </p>

            {/* Faculty list */}
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
              {facultyList.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border border-box-outline p-3 rounded-xl bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="font-medium text-primary-text">{item.name}</p>
                      <p className="text-sub-text text-sm">{item.email}</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 px-3 py-1 text-sm border border-box-outline rounded-full cursor-pointer bg-gray-100 text-primary-text">
                    <span>Needs Approval</span>
                    <input
                      type="checkbox"
                      className="appearance-none w-4 h-4 border border-box-outline checked:bg-main-blue checked:border-main-blue rounded-full accent-main-blue cursor-pointer"
                    />
                  </label>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose} className="overview-btn">
                Cancel
              </button>

              <button className="auth-btn">
                Send for Approval
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SendForApproval;
