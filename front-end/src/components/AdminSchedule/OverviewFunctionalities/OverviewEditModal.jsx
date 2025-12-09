/* eslint-disable no-unused-vars */
import { X, Loader } from "lucide-react";
import { RoutineValidationSchema } from "../../../validations/RoutineValidationSchema";
import { motion, AnimatePresence } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";

const OverviewEditModal = ({ isOpen, routine, onClose, onSubmit }) => {
  if (!isOpen || !routine) return null;

  // validation schema
  const RoutineInitialValues = {
    title: routine.title || '',
    description: routine.description || '',
    effective_from: routine.effective_from ? routine.effective_from.split('T')[0] : '',
    effective_to: routine.effective_to ? routine.effective_to.split('T')[0] : '',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="schedulebtn-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}>

          <motion.div
            className="bg-white dark:bg-dark-overlay dark:text-white rounded-xl w-[550px] p-6 shadow-xl relative"
            initial={{ scale: 0.2, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}>

            <section className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Edit Routine</h2>
              <button onClick={onClose} className="scheduleClose-btn"><X size={20} /></button>
            </section>

            <Formik
              initialValues={RoutineInitialValues}
              validationSchema={RoutineValidationSchema}
              enableReinitialize
              onSubmit={async (values, helpers) => {
                try {
                  await onSubmit(values);
                  helpers.setSubmitting(false);
                } catch (err) {
                  helpers.setSubmitting(false);
                }
              }}>
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="createSchedule-label">Title</label>
                    <Field name="title" className="createSchedule-option" />
                    <div className="text-xs text-error-red my-3"><ErrorMessage name="title" /></div>
                  </div>

                  <div>
                    <label className="createSchedule-label">Description</label>
                    <Field as="textarea" name="description" rows={3} className="createSchedule-option" />
                    <div className="text-xs text-error-red my-3"><ErrorMessage name="description" /></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="createSchedule-label">Effective From</label>
                      <Field name="effective_from" type="date" className="createSchedule-option" />
                      <div className="text-xs text-error-red my-3"><ErrorMessage name="effective_from" /></div>
                    </div>

                    <div>
                      <label className="createSchedule-label">Effective To</label>
                      <Field name="effective_to" type="date" className="createSchedule-option" />
                      <div className="text-xs text-error-red my-3"><ErrorMessage name="effective_to" /></div>
                    </div>
                  </div>


                  <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-box-outline rounded-md cursor-pointer">Cancel</button>
                    <button type="submit" className="auth-btn" disabled={isSubmitting}>{isSubmitting ? <Loader className="animate-spin mx-auto w-6 h-6" size={16} /> : 'Update'}</button>
                  </div>
                </Form>
              )}
            </Formik>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OverviewEditModal