/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

const CourseEditModal = ({ isOpen, onClose, formik, isSubmitting, selectedCourse }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit } = formik;

  return (
    <AnimatePresence>
      {isOpen && selectedCourse && (
        <div className="editmodal-wrapper">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="background-blur"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="editmodal-container max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="x-btn">
              <X size={20} />
            </button>

            <h2 className="form-header text-xl md:text-2xl pr-8">Edit Course Details</h2>
            <p className="form-subtitle-info">
              Course: {selectedCourse.course_name}
            </p>

            {/* Read-only info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 border border-box-outline p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div>
                <label className="form-title sm:text-sm">Department</label>
                <input
                  type="text"
                  value={selectedCourse.department?.code || "N/A"}
                  disabled
                  className="dropdown-select cursor-not-allowed text-sm"
                />
              </div>
              <div>
                <label className="form-title sm:text-sm">Semester</label>
                <input
                  type="text"
                  value={selectedCourse.semester?.name || "N/A"}
                  disabled
                  className="dropdown-select cursor-not-allowed text-sm"
                />
              </div>
              <p className="read-only-text sm:col-span-2">
                Cannot be changed after creation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-title sm:text-sm">Course Name</label>
                  <input
                    type="text"
                    name="course_name"
                    value={values.course_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                  />
                  {touched.course_name && errors.course_name && (
                    <p className="showError text-xs">{errors.course_name}</p>
                  )}
                </div>
                <div>
                  <label className="form-title sm:text-sm">Course Code</label>
                  <input
                    type="text"
                    name="code"
                    value={values.code}
                    onChange={(e) => setFieldValue("code", e.target.value.toUpperCase())}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                  />
                  {touched.code && errors.code && (
                    <p className="showError text-xs">{errors.code}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-title sm:text-sm">Course Type</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                  {["Theory", "Practical", "Theory and Practical"].map((type) => (
                    <label key={type} className="form-selection-label">
                      <input
                        type="radio"
                        name="course_type"
                        value={type}
                        checked={values.course_type === type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="form-radio"
                      />
                      <span className="form-radio-title text-xs sm:text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-title sm:text-sm">Description</label>
                <textarea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="textarea-input h-20 sm:h-24 text-sm"
                  placeholder="Enter description..."
                />
              </div>

              <div>
                <label className="form-title sm:text-sm">Status</label>
                <div className="flex gap-4 sm:gap-6 mt-2">
                  {["active", "inactive"].map((status) => (
                    <label key={status} className="form-selection-label">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={values.status === status}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="form-radio-title capitalize sm:text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-form-actions">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="cancel-btn px-4 text-sm order-2 sm:order-1" 
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="auth-btn px-4 flex items-center justify-center text-sm order-1 sm:order-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" /> 
                      Updating...
                    </>
                  ) : (
                    "Update Changes"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CourseEditModal;