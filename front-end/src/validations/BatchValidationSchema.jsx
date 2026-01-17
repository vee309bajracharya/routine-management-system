/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Initial values for creating a new batch
export const BatchInitialValues = {
  department_id: "",
  semester_id: "",
  batch_name: "",
  code: "",
  year_level: "",
  shift: "Morning",
};

// Validation schema for creating a batch
export const BatchValidationSchema = Yup.object({
  department_id: Yup.string().required("Department is required"),
  semester_id: Yup.string().required("Semester is required"),
  batch_name: Yup.string()
    .required("Batch name is required")
    .max(100, "Batch name must not exceed 100 characters"),
  code: Yup.string()
    .max(50, "Batch code must not exceed 50 characters")
    .nullable(),
  year_level: Yup.number()
    .required("Year level is required")
    .min(1, "Year level must be at least 1")
    .max(8, "Year level must not exceed 8")
    .integer("Year level must be a whole number"),
  shift: Yup.string()
    .required("Shift is required")
    .oneOf(["Morning", "Day", "Evening"], "Invalid shift selected"),
});

// Validation schema for editing a batch (department_id and semester_id are locked)
export const BatchEditValidationSchema = Yup.object({
  batch_name: Yup.string()
    .required("Batch name is required")
    .max(100, "Batch name must not exceed 100 characters"),
  code: Yup.string()
    .max(50, "Batch code must not exceed 50 characters")
    .nullable(),
  year_level: Yup.number()
    .required("Year level is required")
    .min(1, "Year level must be at least 1")
    .max(8, "Year level must not exceed 8")
    .integer("Year level must be a whole number"),
  shift: Yup.string()
    .required("Shift is required")
    .oneOf(["Morning", "Day", "Evening"], "Invalid shift selected"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["active", "inactive", "completed"], "Invalid status selected"),
});
