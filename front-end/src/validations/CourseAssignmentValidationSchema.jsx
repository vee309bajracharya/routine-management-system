/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Initial values for creating course assignment
export const CourseAssignmentInitialValues = {
  department_id: "",
  semester_id: "",
  batch_id: "",
  course_id: "",
  teacher_id: "",
  assignment_type: "Theory",
  status: "active",
  notes: "",
};

// Validation schema for creating course assignment
export const CourseAssignmentValidationSchema = Yup.object({
  department_id: Yup.string().required("Department is required"),
  semester_id: Yup.string().required("Semester is required"),
  batch_id: Yup.string().required("Batch is required"),
  course_id: Yup.string().required("Course is required"),
  teacher_id: Yup.string().required("Teacher is required"),
  assignment_type: Yup.string()
    .required("Assignment type is required")
    .oneOf(
      ["Theory", "Practical", "Theory and Practical"],
      "Invalid assignment type"
    ),
  status: Yup.string().oneOf(
    ["active", "completed", "cancelled"],
    "Invalid status"
  ),
  notes: Yup.string()
    .max(500, "Notes must be at most 500 characters")
    .nullable(),
});

// Validation schema for editing course assignment (without locked fields)
export const CourseAssignmentEditValidationSchema = Yup.object({
  course_id: Yup.string().required("Course is required"),
  teacher_id: Yup.string().required("Teacher is required"),
  assignment_type: Yup.string()
    .required("Assignment type is required")
    .oneOf(
      ["Theory", "Practical", "Theory and Practical"],
      "Invalid assignment type"
    ),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["active", "cancelled"], "Invalid status"),
  notes: Yup.string()
    .max(500, "Notes must be at most 500 characters")
    .nullable(),
});
