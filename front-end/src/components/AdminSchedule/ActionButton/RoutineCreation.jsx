/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { X, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import { useRoutine } from "../../../contexts/RoutineContext";
import axiosClient from "../../../services/api/axiosClient";
import { toast } from "react-toastify";
import { RoutineCreationValidationSchema, RoutineCreationInitialValues } from "../../../validations/RoutineCreationValidationSchema";
import { useNavigate } from "react-router-dom";

const RoutineCreation = ({ isOpen, onClose }) => {

  const { createRoutine } = useRoutine();
  const navigate = useNavigate();

  // dropdown data
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);

  // loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const formik = useFormik({
    initialValues: RoutineCreationInitialValues,
    validationSchema: RoutineCreationValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const newRoutine = await createRoutine(values);
        formik.resetForm();
        onClose();

        // redirect to Routine Planning page with new routine_id
        if(newRoutine?.id){
          navigate(`/admin/schedule/routine?id=${newRoutine.id}`);
        }
      } catch (error) {
        console.error('Failed to create routine : ', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const { values, errors, touched, handleBlur, handleSubmit, handleChange, setFieldValue } = formik;

  // fetch dropdowns for semesters and batch

  useEffect(() => {
    if (isOpen) {
      fetchAllSemesters();
    }
  }, [isOpen]);

  // fetchAllSemesters
  const fetchAllSemesters = async () => {
    setIsLoadingSemesters(true);
    try {
      const response = await axiosClient.get('/admin/dropdowns/all-semesters');
      if (response.data.success) {
        setSemesters(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch semesters : ', error);
      toast.error('Failed to load semesters');
    } finally {
      setIsLoadingSemesters(false);
    }
  };

  // fetchBatches
  const fetchBatches = async (semesterId) => {
    if (!semesterId) {
      setBatches([]);
      return;
    }
    setIsLoadingBatches(true);
    try {
      const response = await axiosClient.get(`/admin/dropdowns/batches-by-semester?semester_id=${semesterId}`);
      if (response.data.success) {
        setBatches(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch batches : ', error);
      toast.error('Failed to load batches');
    } finally {
      setIsLoadingBatches(false);
    }
  };

  /**
   * handle semester change
   *  - update form value
   *  - fetch batches for selected semester
   *  - reset batch selection
   */

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setFieldValue('semester_id', semesterId);
    setFieldValue('batch_id', ''); //reset batch if semester changes
    fetchBatches(semesterId);
  }


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
            className="bg-white dark:bg-dark-overlay rounded-xl w-full max-w-2xl p-6 shadow-xl relative font-general-sans"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >

            {/* form header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Create New Routine</h2>
              <button
                onClick={onClose}
                className="scheduleClose-btn"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {/* form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4">

              <div className="grid grid-cols-2 gap-4">

                {/* semester */}
                <div>
                  <label className="createSchedule-label">
                    Semester <span className="text-error-red">*</span>
                  </label>
                  <select
                    name="semester_id"
                    value={values.semester_id}
                    onChange={handleSemesterChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                    disabled={isLoadingSemesters}
                  >
                    <option value="" className="dark:text-white dark:bg-dark-overlay">
                      {isLoadingSemesters ? "Loading" : "Select Semester"}
                    </option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.display_label}
                      </option>
                    ))}
                  </select>
                  {errors.semester_id && touched.semester_id && (
                    <p className="showError">{errors.semester_id}</p>
                  )}
                </div>

                {/* batch , filtered by semesters */}
                <div>
                  <label className="createSchedule-label">
                    Batch <span className="text-error-red">*</span>
                  </label>
                  <select
                    name="batch_id"
                    value={values.batch_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                    disabled={!values.semester_id || isLoadingBatches}
                  >
                    <option value="">
                      {!values.semester_id
                        ? "Select Semester first"
                        : isLoadingBatches
                          ? "Loading"
                          : "Select Batch"}
                    </option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.display_label}
                      </option>
                    ))}
                  </select>
                  {errors.batch_id && touched.batch_id && (
                    <p className="showError">{errors.batch_id}</p>
                  )}
                </div>

                {/* Routine title */}
                <div className="col-span-2">
                  <label className="createSchedule-label">
                    Routine Title <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                    placeholder=""
                    autoComplete="off"
                  />
                  {errors.title && touched.title && (
                    <p className="showError">{errors.title}</p>
                  )}
                </div>

                {/* Routine description (Optional) */}
                <div className="col-span-2">
                  <label className="createSchedule-label">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                    rows="3"
                    placeholder=""
                  />
                  {errors.description && touched.description && (
                    <p className="showError">{errors.description}</p>
                  )}
                </div>

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

              {/* Action buttons */}
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
                  className="auth-btn w-50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin mx-auto dark:invert" size={16} />
                    </>
                  ) : (
                    "Create Routine"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export default RoutineCreation
