/* eslint-disable no-unused-vars */
import { X, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import { RoutineCreationValidationSchema } from "../../../validations/RoutineCreationValidationSchema";

/**
 * editable fields: title, description, effective_from, effective_to
 * semester_id and batch_id are not editable after creation
 * 
 * @param {boolean} isOpen - Modal visibility
 * @param {object} routine - Routine object to edit
 * @param {function} onClose - Close modal handler
 * @param {function} onSubmit - Submit handler from parent
 */
const OverviewEditModal = ({ isOpen, routine, onClose, onSubmit }) => {

  if (!isOpen || !routine) return null;

  /**
   * Initial values from existing routine data
   * - semester_id and batch_id included but will be disabled (not editable)
   * - Dates formatted to YYYY-MM-DD for HTML date input
   */
  const initialValues = {
    semester_id: routine.semester?.id || "",
    batch_id: routine.batch?.id || "",
    title: routine.title || "",
    description: routine.description || "",
    effective_from: routine.effective_from
      ? routine.effective_from.split('T')[0]
      : "",
    effective_to: routine.effective_to
      ? routine.effective_to.split('T')[0]
      : "",
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: RoutineCreationValidationSchema,
    enableReinitialize: true, // Reinitialize when routine changes
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
        setSubmitting(false);
      } catch (error) {
        console.error("Failed to update routine:", error);
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleSubmit,
    handleChange,
    isSubmitting
  } = formik;

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
            className="bg-white dark:bg-dark-overlay rounded-xl w-full max-w-xl p-6 shadow-xl relative font-general-sans"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Edit Routine</h2>
              <button
                onClick={onClose}
                className="scheduleClose-btn"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* read-only fields (Semester & Batch) */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-hover p-4 rounded-md">

                {/* Semester (Read-only) */}
                <div>
                  <label className="createSchedule-label text-gray-600 dark:text-gray-400">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={routine.semester?.name || "N/A"}
                    className="createSchedule-option bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Cannot be changed after creation
                  </p>
                </div>

                {/* Batch (Read-only) */}
                <div>
                  <label className="createSchedule-label text-gray-600 dark:text-gray-400">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={routine.batch?.name || "N/A"}
                    className="createSchedule-option bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Cannot be changed after creation
                  </p>
                </div>
              </div>

              {/* editable fields */}

              {/* Routine Title */}
              <div>
                <label className="createSchedule-label">
                  Routine Title <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="createSchedule-option"
                  placeholder="Enter routine title"
                  autoComplete="off"
                />
                {errors.title && touched.title && (
                  <p className="showError">{errors.title}</p>
                )}
              </div>

              {/* Routine Description (Optional) */}
              <div>
                <label className="createSchedule-label">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="createSchedule-option"
                  rows="3"
                  placeholder="Enter routine description"
                />
                {errors.description && touched.description && (
                  <p className="showError">{errors.description}</p>
                )}
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-4">

                {/* Effective From Date */}
                <div>
                  <label className="createSchedule-label">
                    Effective From <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="date"
                    name="effective_from"
                    value={values.effective_from}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="createSchedule-option"
                  />
                  {errors.effective_from && touched.effective_from && (
                    <p className="showError">{errors.effective_from}</p>
                  )}
                </div>

                {/* Effective To Date */}
                <div>
                  <label className="createSchedule-label">
                    Effective To <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="date"
                    name="effective_to"
                    value={values.effective_to}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="createSchedule-option"
                    min={values.effective_from}
                  />
                  {errors.effective_to && touched.effective_to && (
                    <p className="showError">{errors.effective_to}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-box-outline rounded-md hover:bg-gray-100 dark:hover:bg-dark-hover text-primary-text dark:text-white transition cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="auth-btn disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin mx-auto dark:invert" size={16} />
                    </>
                  ) : (
                    "Update Routine"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OverviewEditModal;