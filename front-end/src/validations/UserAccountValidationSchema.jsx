/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

export const UserAccountValidationSchema = Yup.object({
  name: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters")
    .trim(),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required")
    .trim(),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[!@#$%^&*(),_>?":{}|<>]/,
      "Password must contain at least one symbol"
    )
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter"),

  role: Yup.string()
    .oneOf(["admin", "teacher"], "Invalid role selected")
    .required("Role is required"),

  phone: Yup.string()
    .nullable()
    .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
    .transform((value) => (value === "" ? null : value)),

  department_id: Yup.string().when("role", {
    is: "teacher",
    then: (schema) => schema.required("Department is required for teachers"),
    otherwise: (schema) => schema.nullable(),
  }),

  employment_type: Yup.string().when("role", {
    is: "teacher",
    then: (schema) =>
      schema
        .oneOf(["Full Time", "Part Time", "Guest"], "Invalid employment type")
        .required("Employment type is required for teachers"),
    otherwise: (schema) => schema.nullable(),
  }),
});

export const UserAccountInitialValues = {
  name: "",
  email: "",
  password: "",
  role: "admin",
  phone: "",
  department_id: "",
  employment_type: "",
};