/* eslint-disable no-unused-vars */
import { X, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TeacherAvailabilityDetailDrawer = ({ isOpen, onClose, teacher, onEditClick, onDeleteClick }) => {
  if (!teacher) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 font-general-sans" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/50" 
            onClick={onClose} 
          />
          <motion.div
            className="drawer-container"
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Sticky Header */}
            <div className="drawer-sticky-header">
              <div className="flex justify-between items-center">
                <h2 className="drawer-title">
                  Teacher Availability Details
                </h2>
                <button onClick={onClose} className="x-btn p-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-24">
              {/* Teacher Header */}
              <div className="flex items-start gap-3">
                <div className="drawer-avatar-box">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-main-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="drawer-header-title">
                    {teacher.teacher_name}
                  </h3>
                  <span className="drawer-count-badge">
                    {teacher.availability_count} Slot{teacher.availability_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div>
                <h4 className="drawer-section-title">
                  Weekly Schedule
                </h4>
                {teacher.schedule?.length > 0 ? (
                  <div className="space-y-3">
                    {teacher.schedule.map((slot) => (
                      <div 
                        key={slot.id} 
                        className="border border-box-outline rounded-lg p-3 bg-gray-50 dark:bg-dark-hover"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start xs:gap-0 md:gap-3">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Clock size={18} className="text-main-blue flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm sm:text-base text-primary-text dark:text-white">
                                {slot.day_of_week}
                              </p>
                              <p className="text-xs sm:text-sm text-sub-text">
                                {slot.available_from} - {slot.available_to}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 self-end sm:self-start">
                            <button 
                              className="action-edit-btn p-2" 
                              onClick={() => onEditClick(slot, teacher)}
                            >
                              <Edit size={14} className="dark:text-white" />
                            </button>
                            <button 
                              className="action-delete-btn p-2" 
                              onClick={() => onDeleteClick(slot, teacher.teacher_name)}
                            >
                              <Trash2 size={14} className="dark:text-white"/>
                            </button>
                          </div>
                        </div>
                        
                        {slot.notes && (
                          <p className="text-xs sm:text-sm text-sub-text xs:mt-0 md:mt-3 ml-6">
                            <span className="font-semibold">Notes:</span> {slot.notes}
                          </p>
                        )}
                        
                        <div className="mt-3 ml-6">
                          <span 
                            className={`text-xs px-2 py-1 rounded ${
                              slot.is_available 
                                ? "drawer-status-active" 
                                : "drawer-status-inactive"
                            }`}
                          >
                            {slot.is_available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 bg-gray-50 dark:bg-dark-hover rounded-lg text-center">
                    <Calendar size={32} className="mx-auto mb-2 text-sub-text opacity-50" />
                    <p className="text-xs sm:text-sm text-sub-text">
                      No availability slots added yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TeacherAvailabilityDetailDrawer;