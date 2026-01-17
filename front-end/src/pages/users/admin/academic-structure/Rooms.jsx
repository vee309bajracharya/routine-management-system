/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { toast } from "react-toastify";
import {
  RoomValidationSchema,
  RoomInitialValues,
} from "../../../../validations/RoomValidationSchema";

const Rooms = () => {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: RoomInitialValues,
    validationSchema: RoomValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur } = formik;

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/rooms", {
        name: values.name,
        room_number: values.room_number,
        room_type: values.room_type,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Room created successfully");
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create room:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create room");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        <h2 className="form-header">Create Room</h2>
        <p className="form-subtext">
          Add new rooms and labs to your institution's infrastructure.
        </p>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4">
          {/* Room Type */}
          <div>
            <label className="form-title">
              Room Type <span className="text-error-red">*</span>
            </label>
            <div className="flex items-center gap-6 mt-2">
              {["Classroom", "Lecture Hall", "Lab"].map((type) => (
                <label key={type} className="form-radio-title">
                  <input
                    type="radio"
                    name="room_type"
                    value={type}
                    checked={values.room_type === type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-radio"
                  />
                  {type}
                </label>
              ))}
            </div>
            {touched.room_type && errors.room_type && (
              <p className="showError">{errors.room_type}</p>
            )}
          </div>

          {/* Room Name and Room Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">
                Room Name <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Computer Lab 1"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.name && errors.name && (
                <p className="showError">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="form-title">
                Room Number <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                name="room_number"
                placeholder="e.g., 101, A-205"
                value={values.room_number}
                onChange={handleChange}
                onBlur={handleBlur}
                className="dropdown-select"
              />
              {touched.room_number && errors.room_number && (
                <p className="showError">{errors.room_number}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => formik.resetForm()}
              disabled={formik.isSubmitting || isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="auth-btn flex items-center justify-center"
              disabled={formik.isSubmitting || isLoading}
            >
              {formik.isSubmitting || isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Room"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Rooms;