/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosClient from "../../services/api/axiosClient";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

// Validation Schema for Teacher Edit (Admin editing teacher)
const TeacherEditValidationSchema = Yup.object({
  department_id: Yup.string().required("Department is required"),
  employment_type: Yup.string()
    .oneOf(["Full Time", "Part Time"])
    .required("Employment type is required"),
});

const TeacherEditModal = ({ isOpen, onClose, teacherData, onSuccess }) => {
  const { user: authUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const institutionId = authUser?.institution_id;
        const res = await axiosClient.get(
          `/admin/dropdowns/departments/${institutionId}`
        );
        if (res.data.success) {
          setDepartments(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen, authUser]);

  const formik = useFormik({
    initialValues: {
      department_id: teacherData?.teacher_info?.department?.id || "",
      employment_type: teacherData?.teacher_info?.employment_type || "",
    },
    validationSchema: TeacherEditValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  const { values, errors, touched, handleChange, handleBlur, resetForm } =
    formik;

  async function handleSubmit(values) {
    setIsLoading(true);
    try {
      const updateData = {};

      // Only include changed fields
      if (values.department_id !== teacherData.teacher_info?.department?.id) {
        updateData.department_id = values.department_id;
      }
      if (
        values.employment_type !== teacherData.teacher_info?.employment_type
      ) {
        updateData.employment_type = values.employment_type;
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsLoading(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/users/${teacherData.id}`,
        updateData
      );

      if (response.data.success) {
        toast.success(response.data.message || "Teacher updated successfully");
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      console.error("Update failed:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(
          firstError || error.response.data.message || "Validation failed"
        );
      } else {
        toast.error(error.userMessage || "Failed to update teacher");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !teacherData) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="editmodal-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="background-blur" onClick={handleClose} />

        <motion.div
          className="faculty-edit-teacher-container"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleClose}
            className="x-btn"
          >
            <X size={20} />
          </button>

          <div className="p-4 sm:p-6">
            <h2 className="form-header text-xl md:text-2xl pr-8">Edit Teacher Details</h2>
            <p className="text-xs sm:text-sm text-sub-text mb-1">{teacherData.name}</p>
            <p className="form-subtitle-info">
              ID: FAC-{String(teacherData.id).padStart(4, "0")}
            </p>

            <form onSubmit={formik.handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Department */}
              <div>
                <label className="form-title text-xs sm:text-sm" htmlFor="department_id">
                  Department <span className="text-error-red">*</span>
                </label>
                <select
                  id="department_id"
                  name="department_id"
                  value={values.department_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="dropdown-select text-sm"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.display_label || dept.department_name}
                    </option>
                  ))}
                </select>
                {touched.department_id && errors.department_id && (
                  <p className="showError text-xs">{errors.department_id}</p>
                )}
              </div>

              {/* Employment Type */}
              <div>
                <div className="form-title text-xs sm:text-sm">
                  Employment Type <span className="text-error-red">*</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                  {["Full Time", "Part Time"].map((type) => (
                    <label key={type} className="form-radio-title flex items-center gap-2 cursor-pointer text-xs sm:text-sm" htmlFor={`employment_type_${type}`}>
                      <input
                        id={`employment_type_${type}`}
                        type="radio"
                        name="employment_type"
                        value={type}
                        checked={values.employment_type === type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="form-radio"
                      />
                      {type}
                    </label>
                  ))}
                </div>
                {touched.employment_type && errors.employment_type && (
                  <p className="showError text-xs">{errors.employment_type}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="modal-form-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="modal-form-actions-cancel cancel-btn"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-form-actions-update auth-btn"
                  disabled={isLoading || formik.isSubmitting}
                >
                  {isLoading || formik.isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeacherEditModal;