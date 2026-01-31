/* eslint-disable no-unused-vars */
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axiosClient from "../../services/api/axiosClient";

const TeacherAvailabilityEditModal = ({ isOpen, onClose, availability, teacher, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    available_from: Yup.string().required("Start time is required"),
    available_to: Yup.string()
      .required("End time is required")
      .test("is-after", "End time must be after start time", function (value) {
        const { available_from } = this.parent;
        if (!available_from || !value) return true;
        return value > available_from;
      }),
    is_available: Yup.boolean(),
    notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
  });

  const formik = useFormik({
    initialValues: availability
      ? {
          available_from: availability.available_from || "",
          available_to: availability.available_to || "",
          is_available: availability.is_available ?? true,
          notes: availability.notes || "",
        }
      : { available_from: "", available_to: "", is_available: true, notes: "" },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const updateData = {};
        if (values.available_from !== availability.available_from) updateData.available_from = values.available_from;
        if (values.available_to !== availability.available_to) updateData.available_to = values.available_to;
        if (values.is_available !== availability.is_available) updateData.is_available = values.is_available;
        if (values.notes !== availability.notes) updateData.notes = values.notes || null;

        if (Object.keys(updateData).length === 0) {
          toast.info("No changes to update");
          setIsSubmitting(false);
          return;
        }

        const response = await axiosClient.put(`/admin/teacher-availability/${availability.id}`, updateData);
        if (response.data.success) {
          toast.success(response.data.message || "Availability updated successfully");
          onClose();
          onSuccess();
        }
      } catch (error) {
        toast.error(error.userMessage || "Failed to update availability");
      } finally {
        setIsSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  if (!availability || !teacher) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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

            <h2 className="form-header text-xl md:text-2xl pr-8">Edit Availability</h2>
            <p className="form-subtitle-info">
              Teacher: {teacher.teacher_name} - {availability.day_of_week}
            </p>
            
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-title sm:text-sm">
                    Available From <span className="text-error-red">*</span>
                  </label>
                  <input 
                    type="time" 
                    name="available_from" 
                    value={formik.values.available_from} 
                    onChange={formik.handleChange} 
                    onBlur={formik.handleBlur} 
                    className="dropdown-select text-sm" 
                  />
                  {formik.touched.available_from && formik.errors.available_from && (
                    <p className="showError text-xs">{formik.errors.available_from}</p>
                  )}
                </div>
                <div>
                  <label className="form-title sm:text-sm">
                    Available To <span className="text-error-red">*</span>
                  </label>
                  <input 
                    type="time" 
                    name="available_to" 
                    value={formik.values.available_to} 
                    onChange={formik.handleChange} 
                    onBlur={formik.handleBlur} 
                    className="dropdown-select text-sm" 
                  />
                  {formik.touched.available_to && formik.errors.available_to && (
                    <p className="showError text-xs">{formik.errors.available_to}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="form-title sm:text-sm">Status</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2">
                  {[ 
                    { value: true, label: "Available" }, 
                    { value: false, label: "Unavailable" } 
                  ].map((status) => (
                    <label key={status.label} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="is_available" 
                        checked={formik.values.is_available === status.value} 
                        onChange={() => formik.setFieldValue("is_available", status.value)} 
                        className="form-radio" 
                      />
                      <span className="form-radio-title text-xs sm:text-sm">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-title sm:text-sm">Notes</label>
                <textarea 
                  name="notes" 
                  value={formik.values.notes} 
                  onChange={formik.handleChange} 
                  onBlur={formik.handleBlur} 
                  className="textarea-input h-20 sm:h-24 text-sm" 
                  placeholder="Add additional notes..." 
                />
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

export default TeacherAvailabilityEditModal;