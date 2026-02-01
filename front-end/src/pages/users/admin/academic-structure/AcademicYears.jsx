import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import {
  AcademicYearValidationSchema,
  AcademicYearInitialValues,
} from "../../../../validations/AcademicYearValidationSchema";

const INSTITUTION_ID = import.meta.env.VITE_INSTITUTION_ID;

const AcademicYears = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Fetch departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosClient.get(
          `/admin/dropdowns/departments/${INSTITUTION_ID}`,
        );
        if (response.data.success) {
          setDepartments(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        toast.error("Failed to load departments");
      }
    };

    fetchDepartments();
  }, []);

  const formik = useFormik({
    initialValues: AcademicYearInitialValues,
    validationSchema: AcademicYearValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur } = formik;

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/academic-years", {
        department_id: values.department_id,
        year_name: values.year_name,
        start_date: values.start_date,
        end_date: values.end_date,
      });

      if (response.data.success) {
        toast.success(
          response.data.message || "Academic year created successfully",
        );
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create academic year:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create academic year");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  return (
    <section className="wrapper mt-5 flex justify-center font-general-sans px-4">
      <div className="w-full max-w-[720px] bg-white dark:bg-dark-overlay rounded-xl border border-box-outline p-4 sm:p-6 md:p-8">
        <h1 className="form-header">Create Academic Year</h1>
        <p className="form-subtext">
          Define academic year periods for organizing semesters and courses.
        </p>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {/* Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-title" htmlFor="department_id">
                Department <span className="text-error-red">*</span>
              </label>
              <select
                id="department_id"
                name="department_id"
                value={values.department_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.display_label || dept.department_name}
                  </option>
                ))}
              </select>
              {touched.department_id && errors.department_id && (
                <p className="showError">{errors.department_id}</p>
              )}
            </div>

            {/* Academic Year Name */}
            <div>
              <label className="form-title" htmlFor="year_name">
                Academic Year Name <span className="text-error-red">*</span>
              </label>
              <input
                id="year_name"
                type="text"
                name="year_name"
                placeholder="DEPT-2023"
                value={values.year_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
                autoComplete="off"
              />
              {touched.year_name && errors.year_name && (
                <p className="showError">{errors.year_name}</p>
              )}
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-title" htmlFor="start_date">
                Start Date <span className="text-error-red">*</span>
              </label>
              <input
                id="start_date"
                type="date"
                name="start_date"
                value={values.start_date}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.start_date && errors.start_date && (
                <p className="showError">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="form-title" htmlFor="end_date">
                End Date <span className="text-error-red">*</span>
              </label>
              <input
                id="end_date"
                type="date"
                name="end_date"
                value={values.end_date}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.end_date && errors.end_date && (
                <p className="showError">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => formik.resetForm()}
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
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AcademicYears;
