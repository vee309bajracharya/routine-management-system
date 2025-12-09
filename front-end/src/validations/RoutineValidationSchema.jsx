
import * as Yup from "yup";

export const RoutineValidationSchema = Yup.object({

  title: Yup.string()
    .trim()
    .required("Title is required")
    .max(255, "Title cannot exceed 255 characters"),

  description: Yup.string()
    .nullable()
    .max(1000, "Description cannot exceed 1000 characters"),

  effective_from: Yup.date()
    .required("Effective From date is required")
    .typeError("Enter a valid date"),

  effective_to: Yup.date()
    .required("Effective To date is required")
    .typeError("Enter a valid date")
    .min(Yup.ref("effective_from"), "Effective To must be after or equal to Effective From"),

});
