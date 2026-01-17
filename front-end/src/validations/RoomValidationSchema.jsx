/* eslint-disable react-refresh/only-export-components */
import * as Yup from "yup";

// Validation Schema for Room Creation
export const RoomValidationSchema = Yup.object({
  name: Yup.string()
    .required("Room name is required")
    .min(2, "Room name must be at least 2 characters")
    .max(255, "Room name must not exceed 255 characters")
    .trim(),

  room_number: Yup.string()
    .required("Room number is required")
    .max(255, "Room number must not exceed 255 characters")
    .trim(),

  room_type: Yup.string()
    .required("Room type is required")
    .oneOf(
      ["Lecture Hall", "Lab", "Classroom"],
      "Invalid room type selected"
    ),

  status: Yup.string()
    .oneOf(["active", "inactive"], "Invalid status")
    .required("Status is required"),
});

// Validation Schema for Room Editing
export const RoomEditValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Room name must be at least 2 characters")
    .max(255, "Room name must not exceed 255 characters")
    .trim(),

  room_number: Yup.string()
    .max(255, "Room number must not exceed 255 characters")
    .trim(),

  room_type: Yup.string().oneOf(
    ["Lecture Hall", "Lab", "Classroom"],
    "Invalid room type selected"
  ),
});

// Initial values for Room form
export const RoomInitialValues = {
  name: "",
  room_number: "",
  room_type: "Classroom",
  status: "active",
};