/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Validation Schema for Course Creation
export const CourseValidationSchema = Yup.object({
  department_id: Yup.string()
    .required("Department is required"),

  semester_id: Yup.string()
    .required("Semester is required"),

  course_name: Yup.string()
    .required("Course name is required")
    .min(2, "Course name must be at least 2 characters")
    .max(255, "Course name must not exceed 255 characters")
    .trim(),

  code: Yup.string()
    .required("Course code is required")
    .max(50, "Course code must not exceed 50 characters")
    .trim()
    .matches(/^[A-Z0-9\s-]+$/i, "Course code can only contain letters, numbers, spaces, and hyphens"),

  course_type: Yup.string()
    .required("Course type is required")
    .oneOf(["Theory", "Practical", "Theory and Practical"], "Invalid course type"),

  description: Yup.string()
    .nullable()
    .max(500, "Description must not exceed 500 characters")
    .trim(),

  status: Yup.string()
    .oneOf(["active", "inactive"], "Invalid status"),
});

// Validation Schema for Course Editing
export const CourseEditValidationSchema = Yup.object({
  course_name: Yup.string()
    .min(2, "Course name must be at least 2 characters")
    .max(255, "Course name must not exceed 255 characters")
    .trim(),

  code: Yup.string()
    .max(50, "Course code must not exceed 50 characters")
    .trim()
    .matches(/^[A-Z0-9\s-]+$/i, "Course code can only contain letters, numbers, spaces, and hyphens"),

  course_type: Yup.string()
    .oneOf(["Theory", "Practical", "Theory and Practical"], "Invalid course type"),

  description: Yup.string()
    .nullable()
    .max(500, "Description must not exceed 500 characters")
    .trim(),

  status: Yup.string()
    .oneOf(["active", "inactive"], "Invalid status"),
});

// Initial values for Course form
export const CourseInitialValues = {
  department_id: "",
  semester_id: "",
  course_name: "",
  code: "",
  course_type: "Theory",
  description: "",
  status: "active",
};