/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Validation Schema for Department Creation
export const DepartmentValidationSchema = Yup.object({
  department_name: Yup.string()
    .required("Department name is required")
    .min(3, "Department name must be at least 3 characters")
    .max(255, "Department name must not exceed 255 characters")
    .trim(),

  code: Yup.string()
    .required("Department code is required")
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code must not exceed 50 characters")
    .matches(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only")
    .trim(),

  head_teacher_id: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  description: Yup.string()
    .nullable()
    .max(500, "Description must not exceed 500 characters")
    .transform((value) => (value === "" ? null : value)),

});

// Initial Values for Department Form
export const DepartmentInitialValues = {
  department_name: "",
  code: "",
  head_teacher_id: "",
  description: "",
  status: "active",
};

// Validation Schema for Department Edit
export const DepartmentEditValidationSchema = Yup.object({
  department_name: Yup.string()
    .min(3, "Department name must be at least 3 characters")
    .max(255, "Department name must not exceed 255 characters")
    .trim(),

  code: Yup.string()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code must not exceed 50 characters")
    .matches(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only")
    .trim(),

  head_teacher_id: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),

  description: Yup.string()
    .nullable()
    .max(500, "Description must not exceed 500 characters")
    .transform((value) => (value === "" ? null : value)),

  status: Yup.string()
    .oneOf(["active", "inactive"], "Invalid status"),
});