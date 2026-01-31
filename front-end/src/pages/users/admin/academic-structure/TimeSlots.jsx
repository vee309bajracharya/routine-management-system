/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Loader2, ChevronDown, X } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import {
  TimeSlotValidationSchema,
  TimeSlotInitialValues,
} from "../../../../validations/TimeSlotValidationSchema";

const TimeSlots = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [applicableDaysOpen, setApplicableDaysOpen] = useState(false);

  const days = [
    { value: "Sunday", label: "Sun" },
    { value: "Monday", label: "Mon" },
    { value: "Tuesday", label: "Tue" },
    { value: "Wednesday", label: "Wed" },
    { value: "Thursday", label: "Thu" },
    { value: "Friday", label: "Fri" },
  ];

  const formik = useFormik({
    initialValues: TimeSlotInitialValues,
    validationSchema: TimeSlotValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;
  useEffect(() => {
    const duration = calculateDuration(values.start_time, values.end_time);

    if (duration) {
      setFieldValue("duration_minutes", duration);
    } else {
      setFieldValue("duration_minutes", "");
    }
  }, [values.start_time, values.end_time]);

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

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/time-slots", {
        department_id: values.department_id,
        semester_id: values.semester_id,
        batch_id: values.batch_id,
        name: values.name,
        start_time: values.start_time,
        end_time: values.end_time,
        duration_minutes: values.duration_minutes,
        shift: values.shift,
        slot_type: values.slot_type,
        applicable_days: values.applicable_days,
        is_active: values.is_active,
      });

      if (response.data.success) {
        toast.success(
          response.data.message || "Time slot created successfully",
        );
        // Preserve department, semester, and batch while resetting other fields
        const preservedDepartmentId = values.department_id;
        const preservedSemesterId = values.semester_id;
        const preservedBatchId = values.batch_id;
        resetForm();
        setFieldValue("department_id", preservedDepartmentId);
        setFieldValue("semester_id", preservedSemesterId);
        setFieldValue("batch_id", preservedBatchId);
      }
    } catch (error) {
      console.error("Failed to create time slot:", error);
      toast.error(error.userMessage || "Failed to create time slot");

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create time slot");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  const toggleDay = (day) => {
    const currentDays = values.applicable_days;
    if (currentDays.includes(day)) {
      setFieldValue(
        "applicable_days",
        currentDays.filter((d) => d !== day),
      );
    } else {
      setFieldValue("applicable_days", [...currentDays, day]);
    }
  };

  const selectAllDays = () => {
    setFieldValue(
      "applicable_days",
      days.map((d) => d.value),
    );
  };

  const removeSelectedDay = (day) => {
    setFieldValue(
      "applicable_days",
      values.applicable_days.filter((d) => d !== day),
    );
  };
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) return "";

    return endMinutes - startMinutes;
  };

  return (
    <div className="wrapper mt-5 flex justify-center font-general-sans px-4">
      <div className="w-full max-w-[720px] bg-white dark:bg-dark-overlay rounded-xl border border-box-outline p-4 sm:p-6 md:p-8">
        <h2 className="form-header">Create Time Slot</h2>
        <p className="form-subtext">
          Define time slots for scheduling classes, breaks, and practical
          sessions.
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

          {/* Batch and Name */}
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
                Time Slot Name <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="BCA Morning/Day Class 1/Practical"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.name && errors.name && (
                <p className="showError">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Slot Type and Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Slot Type <span className="text-error-red">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-2">
                {["Lecture", "Practical", "Break"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="slot_type"
                      value={type}
                      checked={values.slot_type === type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-radio"
                    />
                    <span className="form-radio-title">{type}</span>
                  </label>
                ))}
              </div>
              {touched.slot_type && errors.slot_type && (
                <p className="showError">{errors.slot_type}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Shift <span className="text-error-red">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-2">
                {["Morning", "Day"].map((shift) => (
                  <label
                    key={shift}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="shift"
                      value={shift}
                      checked={values.shift === shift}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="form-radio"
                    />
                    <span className="form-radio-title">{shift}</span>
                  </label>
                ))}
              </div>
              {touched.shift && errors.shift && (
                <p className="showError">{errors.shift}</p>
              )}
            </div>
          </div>

          {/* Start Time  End Time  Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-title">
                Start Time <span className="text-error-red">*</span>
              </label>
              <input
                type="time"
                name="start_time"
                value={values.start_time}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.start_time && errors.start_time && (
                <p className="showError">{errors.start_time}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                End Time <span className="text-error-red">*</span>
              </label>
              <input
                type="time"
                name="end_time"
                value={values.end_time}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.end_time && errors.end_time && (
                <p className="showError">{errors.end_time}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Duration (min) <span className="text-error-red">*</span>
              </label>
              <input
                type="number"
                name="duration_minutes"
                placeholder="Auto calculated"
                value={values.duration_minutes}
                disabled
                className="dropdown-select bg-gray-100 cursor-not-allowed"
              />
              {touched.duration_minutes && errors.duration_minutes && (
                <p className="showError">{errors.duration_minutes}</p>
              )}
            </div>
          </div>

          {/* Applicable Days */}
          <div>
            <label className="form-title">
              Applicable Days <span className="text-error-red">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setApplicableDaysOpen(!applicableDaysOpen)}
                className="dropdown-select w-full flex items-center justify-between"
              >
                <div className="flex gap-2 flex-wrap flex-1">
                  {values.applicable_days.length > 0 ? (
                    values.applicable_days.map((day) => (
                      <span
                        key={day}
                        className="inline-flex items-center gap-1 bg-main-blue text-white text-xs px-2 py-1 rounded-full"
                      >
                        {days.find((d) => d.value === day)?.label || day}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedDay(day);
                          }}
                          className="hover:bg-blue-600 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sub-text">Select Days</span>
                  )}
                </div>
                <ChevronDown
                  size={18}
                  className={`text-black dark:text-white transition-transform ${
                    applicableDaysOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {applicableDaysOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-overlay border border-box-outline rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary-text dark:text-white">
                      Working Days
                    </span>
                    <button
                      type="button"
                      onClick={selectAllDays}
                      className="px-3 py-1 bg-main-blue text-white rounded text-xs hover:bg-hover-blue"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {days.map((day) => (
                      <label
                        key={day.value}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={values.applicable_days.includes(day.value)}
                          onChange={() => toggleDay(day.value)}
                          className="form-radio"
                        />
                        <span className="text-primary-text dark:text-white">
                          {day.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {touched.applicable_days && errors.applicable_days && (
              <p className="showError">{errors.applicable_days}</p>
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

export default TimeSlots;
