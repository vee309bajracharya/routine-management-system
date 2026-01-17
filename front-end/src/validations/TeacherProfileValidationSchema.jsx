/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Validation Schema for Teacher Profile Update
export const TeacherProfileValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters")
    .trim(),
  
  email: Yup.string()
    .email("Invalid email format")
    .trim(),

  phone: Yup.string()
    .nullable()
    .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
    .transform((value) => (value === "" ? null : value)),

  current_password: Yup.string().when("password", {
    is: (val) => val && val.length > 0,
    then: (schema) => schema.required("Current password is required to set new password"),
    otherwise: (schema) => schema.nullable(),
  }),

  password: Yup.string()
    .nullable()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*(),_>?":{}|<>]/, "Password must contain at least one symbol"),
    
  password_confirmation: Yup.string().when("password", {
    is: (val) => val && val.length > 0,
    then: (schema) =>
      schema
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    otherwise: (schema) => schema.nullable(),
  }),
});

// Initial values
export const TeacherProfileInitialValues = {
  name: "",
  email: "",
  phone: "",
  current_password: "",
  password: "",
  password_confirmation: "",
};