/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { useAuth } from "../../../../contexts/AuthContext";
import { toast } from "react-toastify";
import {
  DepartmentValidationSchema,
  DepartmentInitialValues,
} from "../../../../validations/DepartmentValidationSchema";

const AcademicDepartments = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch teachers for Head of Department dropdown
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axiosClient.get(`/admin/dropdowns/teachers`);
        if (res.data.success) {
          setTeachers(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };

    fetchTeachers();
  }, [user]);

  const formik = useFormik({
    initialValues: DepartmentInitialValues,
    validationSchema: DepartmentValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/departments", {
        department_name: values.department_name,
        code: values.code.toUpperCase(),
        head_teacher_id: values.head_teacher_id || null,
        description: values.description || null,
      });

      if (response.data.success) {
        toast.success("Department created successfully");
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create department:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.error || error.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create department");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        <h2 className="form-header">Create Department</h2>
        <p className="form-subtext">
          Add new departments to organize your institution's academic structure.
        </p>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {/* Department Name and Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Department Name <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                name="department_name"
                placeholder="Enter Department Name"
                value={values.department_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.department_name && errors.department_name && (
                <p className="showError">{errors.department_name}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Department Code <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                name="code"
                placeholder="e.g., BCA, CSE"
                value={values.code}
                onChange={(e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setFieldValue("code", upperValue);
                }}
                onBlur={handleBlur}
                className="dropdown-select uppercase"
                maxLength="50"
              />
              {touched.code && errors.code && (
                <p className="showError">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Head of Department - FIXED: Use user_id instead of teacher.id */}
          <div>
            <label className="form-title">Head of Department (Optional)</label>
            <select
              name="head_teacher_id"
              value={values.head_teacher_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="dropdown-select"
            >
              <option value="">Select Head of Department</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.user_id}>
                  {teacher.display_label || teacher.name}
                </option>
              ))}
            </select>
            {touched.head_teacher_id && errors.head_teacher_id && (
              <p className="showError">{errors.head_teacher_id}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="form-title">Description (Optional)</label>
            <textarea
              name="description"
              placeholder="Write a description about the department"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              className="textarea-input"
              maxLength="500"
            />
            <div className="flex justify-between items-center mt-1">
              {touched.description && errors.description ? (
                <p className="showError">{errors.description}</p>
              ) : (
                <span className="text-xs text-sub-text">
                  {values.description.length}/500 characters
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                formik.resetForm();
              }}
              disabled={formik.isSubmitting || isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="auth-btn flex items-center justify-center"
              disabled={formik.isSubmitting || isLoading}
            >
              {formik.isSubmitting || isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Department"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicDepartments;