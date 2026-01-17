/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import {
  SemesterValidationSchema,
  SemesterInitialValues,
} from "../../../../validations/SemesterValidatoinSchema";

const Semesters = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [isLoadingYears, setIsLoadingYears] = useState(false);

  // Fetch academic years for dropdown
  useEffect(() => {
    const fetchAcademicYears = async () => {
      setIsLoadingYears(true);
      try {
        const response = await axiosClient.get("/admin/dropdowns/all-academic-years");
        if (response.data.success) {
          setAcademicYears(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch academic years:", error);
        toast.error(error.userMessage || "Failed to load academic years");
      } finally {
        setIsLoadingYears(false);
      }
    };

    fetchAcademicYears();
  }, []);

  const formik = useFormik({
    initialValues: SemesterInitialValues,
    validationSchema: SemesterValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur } = formik;

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/semesters", {
        academic_year_id: values.academic_year_id,
        semester_name: values.semester_name,
        semester_number: parseInt(values.semester_number),
        start_date: values.start_date,
        end_date: values.end_date,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Semester created successfully");
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create semester:", error);
      toast.error(error.userMessage || "Failed to create semester");

      if (error.response?.status === 422) {
        const errors = error.response.data.error || error.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create semester");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        <h2 className="form-header">Create Semester</h2>
        <p className="form-subtext">
          Define semester periods within academic years for organizing courses and batches.
        </p>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {/* Academic Year */}
          <div>
            <label className="form-title">
              Academic Year <span className="text-error-red">*</span>
            </label>
            <select
              name="academic_year_id"
              value={values.academic_year_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="dropdown-select"
              disabled={isLoadingYears}
            >
              <option value="">
                 Select Academic Year
              </option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year_name}
                </option>
              ))}
            </select>
            {touched.academic_year_id && errors.academic_year_id && (
              <p className="showError">{errors.academic_year_id}</p>
            )}
          </div>

          {/* Semester Name and Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Semester Name <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                name="semester_name"
                placeholder="e.g., First Semester, 1st Sem"
                value={values.semester_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.semester_name && errors.semester_name && (
                <p className="showError">{errors.semester_name}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Semester Number <span className="text-error-red">*</span>
              </label>
              <input
                type="number"
                name="semester_number"
                placeholder="Enter number (1-8)"
                value={values.semester_number}
                onChange={handleChange}
                onBlur={handleBlur}
                min="1"
                max="8"
                className="dropdown-select"
              />
              {touched.semester_number && errors.semester_number && (
                <p className="showError">{errors.semester_number}</p>
              )}
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Start Date <span className="text-error-red">*</span>
              </label>
              <input
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
              <label className="form-title">
                End Date <span className="text-error-red">*</span>
              </label>
              <input
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
          <div className="grid grid-cols-2 gap-4 mt-8">
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
                "Create Semester"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Semesters;