/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Validation Schema for Semester Creation
export const SemesterValidationSchema = Yup.object({
  academic_year_id: Yup.string()
    .required("Academic year is required"),

  semester_name: Yup.string()
    .required("Semester name is required")
    .min(2, "Semester name must be at least 2 characters")
    .max(100, "Semester name must not exceed 100 characters")
    .trim(),

  semester_number: Yup.number()
    .required("Semester number is required")
    .integer("Semester number must be an integer")
    .min(1, "Semester number must be at least 1")
    .max(10, "Semester number must not exceed 10")
    .typeError("Semester number must be a number"),

  start_date: Yup.date()
    .required("Start date is required")
    .typeError("Invalid date format"),

  end_date: Yup.date()
    .required("End date is required")
    .typeError("Invalid date format")
    .min(
      Yup.ref("start_date"),
      "End date must be after start date"
    ),

  is_active: Yup.boolean(),
});

// Validation Schema for Semester Editing
export const SemesterEditValidationSchema = Yup.object({
  semester_name: Yup.string()
    .min(2, "Semester name must be at least 2 characters")
    .max(100, "Semester name must not exceed 100 characters")
    .trim(),

  semester_number: Yup.number()
    .integer("Semester number must be an integer")
    .min(1, "Semester number must be at least 1")
    .max(10, "Semester number must not exceed 10")
    .typeError("Semester number must be a number"),

  start_date: Yup.date()
    .typeError("Invalid date format"),

  end_date: Yup.date()
    .typeError("Invalid date format")
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return true;
        return new Date(value) > new Date(start_date);
      }
    ),

  is_active: Yup.boolean(),
});

// Initial values for Semester form
export const SemesterInitialValues = {
  academic_year_id: "",
  semester_name: "",
  semester_number: "",
  start_date: "",
  end_date: "",
  is_active: true,
};