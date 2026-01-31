/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import {
  CourseAssignmentValidationSchema,
  CourseAssignmentInitialValues,
} from "../../../../validations/CourseAssignmentValidationSchema";

const CourseAssignments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const formik = useFormik({
    initialValues: CourseAssignmentInitialValues,
    validationSchema: CourseAssignmentValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoadingDepartments(true);
      try {
        const response = await axiosClient.get(
          `/admin/dropdowns/departments/1`,
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
          { params: { department_id: values.department_id } },
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

  // Fetch batches when semester changes
  useEffect(() => {
    const fetchBatches = async () => {
      if (!values.semester_id) {
        setBatches([]);
        setFieldValue("batch_id", "");
        return;
      }

      setIsLoadingBatches(true);
      try {
        const response = await axiosClient.get(
          "/admin/dropdowns/batches-by-semester",
          { params: { semester_id: values.semester_id } },
        );
        if (response.data.success) {
          setBatches(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch batches:", error);
        toast.error(error.userMessage || "Failed to load batches");
        setBatches([]);
      } finally {
        setIsLoadingBatches(false);
      }
    };
    fetchBatches();
  }, [values.semester_id, setFieldValue]);

  // Fetch courses when department and semester are selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!values.department_id || !values.semester_id) {
        setCourses([]);
        setFieldValue("course_id", "");
        return;
      }

      setIsLoadingCourses(true);
      try {
        const response = await axiosClient.get("/admin/dropdowns/courses", {
          params: {
            department_id: values.department_id,
            semester_id: values.semester_id,
          },
        });
        if (response.data.success) {
          setCourses(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error(error.userMessage || "Failed to load courses");
        setCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [values.department_id, values.semester_id, setFieldValue]);

  // Fetch teachers when department changes
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!values.department_id) {
        setTeachers([]);
        setFieldValue("teacher_id", "");
        return;
      }

      setIsLoadingTeachers(true);
      try {
        const response = await axiosClient.get(`/admin/dropdowns/teachers`);
        if (response.data.success) {
          setTeachers(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        toast.error(error.userMessage || "Failed to load teachers");
        setTeachers([]);
      } finally {
        setIsLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, [values.department_id, setFieldValue]);

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/course-assignments", {
        department_id: values.department_id,
        semester_id: values.semester_id,
        batch_id: values.batch_id,
        course_id: values.course_id,
        teacher_id: values.teacher_id,
        assignment_type: values.assignment_type,
        status: values.status,
        notes: values.notes || null,
      });

      if (response.data.success) {
        toast.success(
          response.data.message || "Course assignment created successfully",
        );
        // Preserve department, semester, and batch, reset other fields
        const preservedDepartmentId = values.department_id;
        const preservedSemesterId = values.semester_id;
        const preservedBatchId = values.batch_id;
        resetForm();
        setFieldValue("department_id", preservedDepartmentId);
        setFieldValue("semester_id", preservedSemesterId);
        setFieldValue("batch_id", preservedBatchId);
      }
    } catch (error) {
      console.error("Failed to create course assignment:", error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create course assignment");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="wrapper mt-5 flex justify-center font-general-sans px-4">
      <div className="w-full max-w-[720px] bg-white dark:bg-dark-overlay rounded-xl border border-box-outline p-4 sm:p-6 md:p-8">
        <h2 className="form-header">Create Course Assignment</h2>
        <p className="form-subtext">
          Assign courses to teachers for specific batches and semesters.
        </p>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {/* Department and Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Department <span className="text-error-red">*</span>
              </label>
              <select
                name="department_id"
                value={values.department_id}
                onChange={(e) => {
                  handleChange(e);
                  setFieldValue("semester_id", "");
                  setFieldValue("batch_id", "");
                  setFieldValue("course_id", "");
                  setFieldValue("teacher_id", "");
                }}
                onBlur={handleBlur}
                className="dropdown-select"
                disabled={isLoadingDepartments}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.display_label}
                  </option>
                ))}
              </select>
              {touched.department_id && errors.department_id && (
                <p className="showError">{errors.department_id}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Semester <span className="text-error-red">*</span>
              </label>
              <select
                name="semester_id"
                value={values.semester_id}
                onChange={(e) => {
                  handleChange(e);
                  setFieldValue("batch_id", "");
                  setFieldValue("course_id", "");
                }}
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

          {/* Batch and Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-title">
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
                    ? "Select Semester First"
                    : isLoadingBatches
                      ? "Loading..."
                      : "Select Batch"}
                </option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.display_label}
                  </option>
                ))}
              </select>
              {touched.batch_id && errors.batch_id && (
                <p className="showError">{errors.batch_id}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Course <span className="text-error-red">*</span>
              </label>
              <select
                name="course_id"
                value={values.course_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
                disabled={
                  !values.department_id ||
                  !values.semester_id ||
                  isLoadingCourses
                }
              >
                <option value="">
                  {!values.department_id || !values.semester_id
                    ? "Select Dept. & Semester First"
                    : isLoadingCourses
                      ? "Loading..."
                      : "Select Course"}
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.display_label}
                  </option>
                ))}
              </select>
              {touched.course_id && errors.course_id && (
                <p className="showError">{errors.course_id}</p>
              )}
            </div>
          </div>

          {/* Teacher and Assignment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Teacher <span className="text-error-red">*</span>
              </label>
              <select
                name="teacher_id"
                value={values.teacher_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
                disabled={!values.department_id || isLoadingTeachers}
              >
                <option value="">
                  {!values.department_id
                    ? "Select Department First"
                    : isLoadingTeachers
                      ? "Loading..."
                      : "Select Teacher"}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.display_label}
                  </option>
                ))}
              </select>
              {touched.teacher_id && errors.teacher_id && (
                <p className="showError">{errors.teacher_id}</p>
              )}
            </div>

            <div>
              <label className="form-title" htmlFor="assignmentType">
                Assignment Type <span className="text-error-red">*</span>
              </label>
              <div className="flex items-center gap-4 sm:gap-6 mt-2">
                {["Theory", "Practical", "Theory and Practical"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      id="assignmentType"
                      name="assignment_type"
                      value={type}
                      checked={values.assignment_type === type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-radio"
                    />
                    <span className="form-radio-title text-xs">{type}</span>
                  </label>
                ))}
              </div>
              {touched.assignment_type && errors.assignment_type && (
                <p className="showError">{errors.assignment_type}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="form-title">
              Notes <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <textarea
              name="notes"
              placeholder="Add additional notes about this assignment..."
              value={values.notes}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              className="textarea-input resize-none"
            />
            {touched.notes && errors.notes && (
              <p className="showError">{errors.notes}</p>
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
                setBatches([]);
                setCourses([]);
                setTeachers([]);
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
    </div>
  );
};

export default CourseAssignments;
