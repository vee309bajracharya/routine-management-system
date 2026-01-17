/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Initial values for creating time slot
export const TimeSlotInitialValues = {
  department_id: "",
  semester_id: "",
  batch_id: "",
  name: "",
  start_time: "",
  end_time: "",
  duration_minutes: "",
  shift: "Morning",
  slot_type: "Lecture",
  applicable_days: [],
  is_active: true,
};

// Validation schema for creating time slot
export const TimeSlotValidationSchema = Yup.object({
  department_id: Yup.string().required("Department is required"),
  semester_id: Yup.string().required("Semester is required"),
  batch_id: Yup.string().required("Batch is required"),
  name: Yup.string()
    .required("Time slot name is required")
    .max(255, "Name must be at most 255 characters"),
  start_time: Yup.string()
    .required("Start time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  end_time: Yup.string()
    .required("End time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .test(
      "is-after-start",
      "End time must be after start time",
      function (value) {
        const { start_time } = this.parent;
        if (!start_time || !value) return true;
        return value > start_time;
      }
    ),
  duration_minutes: Yup.number()
    .required("Duration is required")
    .min(15, "Duration must be at least 15 minutes")
    .max(180, "Duration must be at most 180 minutes"),
  shift: Yup.string()
    .required("Shift is required")
    .oneOf(["Morning", "Day"], "Invalid shift selection"),
  slot_type: Yup.string()
    .required("Slot type is required")
    .oneOf(["Lecture", "Practical", "Break"], "Invalid slot type"),
  applicable_days: Yup.array()
    .of(
      Yup.string().oneOf([
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ])
    )
    .min(1, "At least one day must be selected"),
  is_active: Yup.boolean(),
});

// Validation schema for editing time slot (without locked fields)
export const TimeSlotEditValidationSchema = Yup.object({
  name: Yup.string()
    .required("Time slot name is required")
    .max(255, "Name must be at most 255 characters"),
  start_time: Yup.string()
    .required("Start time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  end_time: Yup.string()
    .required("End time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .test(
      "is-after-start",
      "End time must be after start time",
      function (value) {
        const { start_time } = this.parent;
        if (!start_time || !value) return true;
        return value > start_time;
      }
    ),
  duration_minutes: Yup.number()
    .required("Duration is required")
    .min(15, "Duration must be at least 15 minutes")
    .max(180, "Duration must be at most 180 minutes"),
  shift: Yup.string()
    .required("Shift is required")
    .oneOf(["Morning", "Day"], "Invalid shift selection"),
  slot_type: Yup.string()
    .required("Slot type is required")
    .oneOf(["Lecture", "Practical", "Break"], "Invalid slot type"),
  applicable_days: Yup.array()
    .of(
      Yup.string().oneOf([
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ])
    )
    .min(1, "At least one day must be selected"),
  is_active: Yup.boolean(),
});
