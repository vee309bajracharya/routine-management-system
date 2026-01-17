import { useState, useEffect } from "react";
import { Clock, Loader2, Info } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import * as Yup from "yup";

const TeacherAvailability = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    { short: "Sun", full: "Sunday" },
    { short: "Mon", full: "Monday" },
    { short: "Tue", full: "Tuesday" },
    { short: "Wed", full: "Wednesday" },
    { short: "Thu", full: "Thursday" },
    { short: "Fri", full: "Friday" },
  ];

  // Validation Schema
  const validationSchema = Yup.object({
    teacher_id: Yup.string().required("Teacher selection is required"),
    days: Yup.array()
      .min(1, "Please select at least one day")
      .required("Days selection is required"),
    notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),
  });

  const formik = useFormik({
    initialValues: {
      teacher_id: "",
      days: [],
      timeSlots: {},
      notes: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    resetForm,
  } = formik;

  // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await axiosClient.get("/admin/dropdowns/teachers");
        if (response.data.success) {
          setTeachers(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        toast.error(error.userMessage || "Failed to load teachers");
      } finally {
        setIsLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  // Toggle individual day
  const toggleDay = (dayShort) => {
    const currentDays = values.days;
    if (currentDays.includes(dayShort)) {
      setFieldValue(
        "days",
        currentDays.filter((d) => d !== dayShort)
      );
    } else {
      setFieldValue("days", [...currentDays, dayShort]);
    }
  };

  // Select all days
  const selectAllDays = () => {
    setFieldValue(
      "days",
      daysOfWeek.map((d) => d.short)
    );
  };

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsSubmitting(true);
    try {
      const fullDayNames = values.days.map((shortDay) => {
        const day = daysOfWeek.find((d) => d.short === shortDay);
        return day ? day.full : shortDay;
      });
      const firstDayKey = values.days[0]
        ? daysOfWeek.find((d) => d.short === values.days[0]).full.toLowerCase()
        : "";
      const slot = values.timeSlots[firstDayKey] || {};

      const payload = {
        teacher_id: values.teacher_id,
        days: fullDayNames, 
        available_from: slot.from || "09:00", 
        available_to: slot.to || "17:00", 
        notes: values.notes || null,
      };

      console.log("Sending Payload:", payload); 

      const response = await axiosClient.post(
        "/admin/teacher-availability",
        payload
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Availability created successfully"
        );
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create availability:", error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error("Failed to create availability");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        <h2 className="form-header">Teacher Availability</h2>
        <p className="form-subtext">
          Set weekly time slots and availability for faculty members.
        </p>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {/* Teacher Selection */}
          <div>
            <label className="form-title">
              Teacher Name <span className="text-error-red">*</span>
            </label>
            <select
              name="teacher_id"
              value={values.teacher_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="dropdown-select"
              disabled={isLoadingTeachers}
            >
              <option value="">Select Teacher</option>
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

          {/* Days of Week Selection */}
          <div>
            <label className="form-title">
              Days of Week <span className="text-error-red">*</span>
            </label>
            <div className="flex items-center gap-2 mb-4">
              {daysOfWeek.map((day) => (
                <label
                  key={day.short}
                  className="flex items-center gap-2 cursor-pointer dark:text-white"
                >
                  <input
                    type="checkbox"
                    checked={values.days.includes(day.short)}
                    onChange={() => toggleDay(day.short)}
                    onBlur={handleBlur}
                    className="form-radio"
                  />
                  {day.short}
                </label>
              ))}
              <button
                type="button"
                onClick={selectAllDays}
                className="ml-auto px-4 py-2 bg-main-blue text-white rounded-lg text-sm hover:bg-hover-blue"
              >
                All
              </button>
            </div>
            {touched.days && errors.days && (
              <p className="showError mb-4">{errors.days}</p>
            )}
          </div>

          {/* Selected Days Time Slots */}
          <div className="space-y-3">
            <label className="form-title">Set Time Slots</label>

            {values.days.length === 0 ? (
              <div className="text-center text-sub-text py-8 border-2 border-dashed border-box-outline rounded-lg">
                No Days Selected. Please select days above to set time.
              </div>
            ) : (
              values.days.map((dayShort) => {
                const dayObj = daysOfWeek.find((d) => d.short === dayShort);
                const dayKey = dayObj.full.toLowerCase().replace(" ", "");

                return (
                  <div
                    key={dayShort}
                    className="flex items-center gap-3 p-3 border border-box-outline rounded-lg dark:text-white bg-white dark:bg-dark-card"
                  >
                    <Clock size={16} className="text-sub-text" />
                    <span className="font-medium text-sm min-w-[80px]">
                      {dayObj.full}
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        name={`timeSlots.${dayKey}.from`}
                        value={values.timeSlots?.[dayKey]?.from || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="dropdown-select w-28"
                      />
                      <span className="text-sub-text">-</span>
                      <input
                        type="time"
                        name={`timeSlots.${dayKey}.to`}
                        value={values.timeSlots?.[dayKey]?.to || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="dropdown-select w-28"
                      />
                    </div>

                    

                    <Info
                      size={16}
                      className="text-sub-text cursor-pointer ml-auto hover:text-main-blue"
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="form-title">
              Notes <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <textarea
              name="notes"
              placeholder="Add additional notes about availability..."
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
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => resetForm()}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="auth-btn flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Availability"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherAvailability;
