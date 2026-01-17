import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import {
  BatchValidationSchema,
  BatchInitialValues,
} from "../../../../validations/BatchValidationSchema";

const Batches = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  const formik = useFormik({
    initialValues: BatchInitialValues,
    validationSchema: BatchValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch semesters when department changes
  useEffect(() => {
    if (values.department_id) {
      fetchSemestersByDepartment(values.department_id);
    } else {
      setSemesters([]);
      setFieldValue("semester_id", "");
    }
  }, [values.department_id]);

  // Fetch departments
  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await axiosClient.get("/admin/dropdowns/departments/1");
      
      if (response.data.success) {
        setDepartments(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast.error(error.userMessage || "Failed to load departments");
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch semesters by department
  const fetchSemestersByDepartment = async (departmentId) => {
    setLoadingSemesters(true);
    try {
      const response = await axiosClient.get(
        `/admin/dropdowns/semesters-by-department?department_id=${departmentId}`
      );

      if (response.data.success) {
        setSemesters(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
      toast.error(error.userMessage || "Failed to load semesters");
      setSemesters([]);
    } finally {
      setLoadingSemesters(false);
    }
  };

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/batches", {
        department_id: values.department_id,
        semester_id: values.semester_id,
        batch_name: values.batch_name,
        code: values.code || null,
        year_level: parseInt(values.year_level),
        shift: values.shift,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Batch created successfully");
        resetForm();
        setSemesters([]);
      }
    } catch (error) {
      console.error("Failed to create batch:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create batch");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        <h2 className="form-header">Create Batch</h2>
        <p className="form-subtext">
          Create batches for organizing students by semester, department, and shift.
        </p>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {/* Department Name and Semester Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Department Name <span className="text-error-red">*</span>
              </label>
              <select
                name="department_id"
                value={values.department_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
                disabled={loadingDepartments}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code}
                  </option>
                ))}
              </select>
              {touched.department_id && errors.department_id && (
                <p className="showError">{errors.department_id}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Semester Name <span className="text-error-red">*</span>
              </label>
              <select
                name="semester_id"
                value={values.semester_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
                disabled={!values.department_id || loadingSemesters}
              >
                <option value="">
                  {loadingSemesters
                    ? "Loading..."
                    : !values.department_id
                    ? "Select Department First"
                    : "Select Semester"}
                </option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.semester_name} ({sem.academic_year})
                  </option>
                ))}
              </select>
              {touched.semester_id && errors.semester_id && (
                <p className="showError">{errors.semester_id}</p>
              )}
            </div>
          </div>

          {/* Batch Name and Batch Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Batch Name <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                name="batch_name"
                placeholder="e.g., 2022 BCA Batch"
                value={values.batch_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.batch_name && errors.batch_name && (
                <p className="showError">{errors.batch_name}</p>
              )}
            </div>

            <div>
              <label className="form-title">Batch Code</label>
              <input
                type="text"
                name="code"
                placeholder="e.g., BCA-2022"
                value={values.code}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.code && errors.code && (
                <p className="showError">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Year Level and Shift */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Year Level <span className="text-error-red">*</span>
              </label>
              <input
                type="number"
                name="year_level"
                placeholder="e.g., 4"
                value={values.year_level}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
                min="1"
                max="8"
              />
              {touched.year_level && errors.year_level && (
                <p className="showError">{errors.year_level}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Shift <span className="text-error-red">*</span>
              </label>
              <div className="flex items-center gap-6 mt-2">
                {["Morning", "Day"].map((shift) => (
                  <label key={shift} className="form-radio-title">
                    <input
                      type="radio"
                      name="shift"
                      value={shift}
                      checked={values.shift === shift}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-radio"
                    />
                    {shift}
                  </label>
                ))}
              </div>
              {touched.shift && errors.shift && (
                <p className="showError">{errors.shift}</p>
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
                setSemesters([]);
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
                "Create Batch"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Batches;