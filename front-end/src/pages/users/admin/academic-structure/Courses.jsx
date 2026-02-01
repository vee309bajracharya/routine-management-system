import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import {
  CourseValidationSchema,
  CourseInitialValues,
} from "../../../../validations/CourseValidationSchema";

const INSTITUTION_ID = import.meta.env.VITE_INSTITUTION_ID;

const Courses = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);

  const formik = useFormik({
    initialValues: CourseInitialValues,
    validationSchema: CourseValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoadingDepartments(true);
      try {
        const response = await axiosClient.get(
          `/admin/dropdowns/departments/${INSTITUTION_ID}`
        );

        if (response.data.success) {
          setDepartments(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        toast.error(error.userMessage || "Failed to load departments");
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch semesters when department changes
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!values.department_id) {
        setSemesters([]);
        setFieldValue("semester_id", "");
        return;
      }

      setIsLoadingSemesters(true);
      try {
        const response = await axiosClient.get(
          "/admin/dropdowns/semesters-by-department",
          {
            params: { department_id: values.department_id },
          }
        );

        if (response.data.success) {
          setSemesters(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch semesters:", error);
        toast.error(error.userMessage || "Failed to load semesters");
        setSemesters([]);
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [values.department_id, setFieldValue]);

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/courses", {
        department_id: values.department_id,
        semester_id: values.semester_id,
        course_name: values.course_name,
        code: values.code.toUpperCase(),
        course_type: values.course_type,
        description: values.description || null,
        status: values.status,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Course created successfully");
        // Preserve department and semester, reset other fields
        const preservedDepartmentId = values.department_id;
        const preservedSemesterId = values.semester_id;
        resetForm();
        setFieldValue("department_id", preservedDepartmentId);
        setFieldValue("semester_id", preservedSemesterId);
      }
    } catch (error) {
      console.error("Failed to create course:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create course");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  return (
    <section className="wrapper mt-5 flex justify-center font-general-sans px-4">
      <div className="w-full max-w-[720px] bg-white dark:bg-dark-overlay rounded-xl border border-box-outline p-4 sm:p-6 md:p-8">
        <h1 className="form-header">Create Course</h1>
        <p className="form-subtext">
          Add new courses to your institution's academic structure and assign
          them to departments and semesters.
        </p>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {/* Department and Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-title" htmlFor="department_id">
                Department <span className="text-error-red">*</span>
              </label>
              <select
                id="department_id"
                name="department_id"
                value={values.department_id}
                onChange={(e) => {
                  handleChange(e);
                  setFieldValue("semester_id", "");
                }}
                onBlur={handleBlur}
                className="dropdown-select"
                disabled={isLoadingDepartments}
              >
                <option value="">
                  Select Department
                </option>
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
              <label className="form-title" htmlFor="semester_id">
                Semester <span className="text-error-red">*</span>
              </label>
              <select
                id="semester_id"
                name="semester_id"
                value={values.semester_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
                disabled={!values.department_id || isLoadingSemesters}
              >
                <option value="">
                  {!values.department_id
                    ? "Select Department First"
                    : isLoadingSemesters
                      ? "Loading..."
                      : "Select Semester"}
                </option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.semester_name} - {sem.academic_year}
                  </option>
                ))}
              </select>
              {touched.semester_id && errors.semester_id && (
                <p className="showError">{errors.semester_id}</p>
              )}
            </div>
          </div>

          {/* Course Name and Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-title" htmlFor="course_name">
                Course Name <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                id="course_name"
                name="course_name"
                placeholder="Cybersecurity"
                value={values.course_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
                autoComplete="off"
              />
              {touched.course_name && errors.course_name && (
                <p className="showError">{errors.course_name}</p>
              )}
            </div>

            <div>
              <label className="form-title" htmlFor="code">
                Course Code <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                placeholder="CACS-401"
                value={values.code}
                onChange={(e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setFieldValue("code", upperValue);
                }}
                onBlur={handleBlur}
                className="dropdown-select"
                autoComplete="off"
              />
              {touched.code && errors.code && (
                <p className="showError">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Course Type */}
          <div>
            <label className="form-title" htmlFor="type">
              Course Type <span className="text-error-red">*</span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-2">
              {["Theory", "Practical", "Theory and Practical"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    id="type"
                    name="course_type"
                    value={type}
                    checked={values.course_type === type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-radio"
                  />
                  <span className="form-radio-title">{type}</span>
                </label>
              ))}
            </div>
            {touched.course_type && errors.course_type && (
              <p className="showError">{errors.course_type}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="form-title" htmlFor="description">
              Description{" "}
              <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Write a brief description about the course..."
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              className="textarea-input resize-none"
            />
            {touched.description && errors.description && (
              <p className="showError">{errors.description}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
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
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Courses;