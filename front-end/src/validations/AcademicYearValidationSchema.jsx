/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Validation Schema for Academic Year Creation
export const AcademicYearValidationSchema = Yup.object({
  department_id: Yup.string().required("Department is required"),

  year_name: Yup.string()
    .required("Academic year name is required")
    .min(2, "Year name must be at least 2 characters")
    .max(255, "Year name must not exceed 255 characters")
    .trim(),

  start_date: Yup.date()
    .required("Start date is required")
    .typeError("Invalid date format"),

  end_date: Yup.date()
    .required("End date is required")
    .typeError("Invalid date format")
    .min(Yup.ref("start_date"), "End date must be after start date"),

  is_active: Yup.boolean(),
});

// Validation Schema for Academic Year Editing
export const AcademicYearEditValidationSchema = Yup.object({
  year_name: Yup.string()
    .min(2, "Year name must be at least 2 characters")
    .max(255, "Year name must not exceed 255 characters")
    .trim(),

  start_date: Yup.date().typeError("Invalid date format"),

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

// Initial values for Academic Year form
export const AcademicYearInitialValues = {
  department_id: "",
  year_name: "",
  start_date: "",
  end_date: "",
  is_active: true,
};
