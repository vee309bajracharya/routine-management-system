/* eslint-disable no-unused-vars */
import { X, Loader2 } from "lucide-react";
import { useRoutine } from "../../../contexts/RoutineContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  RoutineSavedVersionInitialValues,
  RoutineSavedVersionValidationSchema
} from "../../../validations/RoutineSavedVersionValidationSchema";
import { useFormik } from "formik";
import { toast } from "react-toastify";

const SaveSchedule = ({ isOpen, onClose }) => {
  const { currentRoutine, saveRoutineVersion, isLoading } = useRoutine();

  const formik = useFormik({
    initialValues: RoutineSavedVersionInitialValues,
    validationSchema: RoutineSavedVersionValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur } = formik;

  async function handleSubmit(values) {
    if (!currentRoutine?.id) return;
    try {
      await saveRoutineVersion(currentRoutine.id, {
        label: values.label,
        description: values.description,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save routine version:", error);
      toast.error('Failed to save routine version');
    }
  };

  if (!currentRoutine) return null;

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
            className="bg-white dark:bg-dark-overlay rounded-xl w-[500px] p-6 shadow-xl relative font-general-sans"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Save Routine Version</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X size={20} />
              </button>
            </div>

            {/* Current Routine Info */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-dark-hover rounded-md">
              <p className="text-sm text-primary-text dark:text-white font-medium">
                <span className="font-semibold">Routine:</span> {currentRoutine.title}
              </p>
              <p className="text-xs text-sub-text mt-1 dark:text-white">
                This will save the current state of all entries in this routine
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-5">

              <div>
                <label className="createSchedule-label">
                  Version Label <span className="text-error-red">*</span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={values.label}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Draft 1, Final Version, Backup"
                  className="createSchedule-option"
                  required
                />
                {touched.label && errors.label && (
                  <p className="showError">{errors.label}</p>
                )}
              </div>

              <div>
                <label className="createSchedule-label">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="3"
                  placeholder="Add notes about this version..."
                  className="createSchedule-option"
                ></textarea>
                {touched.description && errors.description && (
                  <p className="showError">{errors.description}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-box-outline rounded-md transition cursor-pointer dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="auth-btn w-50 justify-center cursor-pointer auth-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mx-auto" size={16} />
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default SaveSchedule;