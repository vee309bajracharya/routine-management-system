/* eslint-disable no-unused-vars */
import React from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import { TimeSlotEditValidationSchema } from "../../validations/TimeSlotValidationSchema";
import axiosClient from "../../services/api/axiosClient";
import { toast } from "react-toastify";

const TimeSlotEditModal = ({
  isOpen,
  onClose,
  selectedSlot,
  slotDetails,
  isLoadingDetails,
  onUpdateSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [applicableDaysOpen, setApplicableDaysOpen] = React.useState(false);

  const days = [
    { value: "Sunday", label: "Sun" },
    { value: "Monday", label: "Mon" },
    { value: "Tuesday", label: "Tue" },
    { value: "Wednesday", label: "Wed" },
    { value: "Thursday", label: "Thu" },
    { value: "Friday", label: "Fri" },
  ];

  const formik = useFormik({
    initialValues: slotDetails
      ? {
          name: slotDetails.name || "",
          start_time: slotDetails.start_time || "",
          end_time: slotDetails.end_time || "",
          duration_minutes: slotDetails.duration_minutes || "",
          shift: slotDetails.shift || "Morning",
          slot_type: slotDetails.slot_type || "Lecture",
          applicable_days: slotDetails.applicable_days || [],
          is_active: slotDetails.is_active ?? true,
        }
      : {
          name: "",
          start_time: "",
          end_time: "",
          duration_minutes: "",
          shift: "Morning",
          slot_type: "Lecture",
          applicable_days: [],
          is_active: true,
        },
    validationSchema: TimeSlotEditValidationSchema,
    onSubmit: handleEditSubmit,
    enableReinitialize: true,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, resetForm } =
    formik;

  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};

      // Compare and add only changed fields
      if (values.name !== slotDetails.name) updateData.name = values.name;
      if (values.start_time !== slotDetails.start_time)
        updateData.start_time = values.start_time;
      if (values.end_time !== slotDetails.end_time)
        updateData.end_time = values.end_time;
      if (values.duration_minutes !== slotDetails.duration_minutes)
        updateData.duration_minutes = values.duration_minutes;
      if (values.shift !== slotDetails.shift) updateData.shift = values.shift;
      if (values.slot_type !== slotDetails.slot_type)
        updateData.slot_type = values.slot_type;
      if (values.is_active !== slotDetails.is_active)
        updateData.is_active = values.is_active;

      // Check if applicable_days changed
      const currentDays = JSON.stringify(slotDetails.applicable_days?.sort());
      const newDays = JSON.stringify(values.applicable_days?.sort());
      if (currentDays !== newDays) {
        updateData.applicable_days = values.applicable_days;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/time-slots/${slotDetails.id}`,
        updateData
      );

      if (response.data.success) {
        toast.success(response.data.message || "Time slot updated successfully");
        onClose();
        if (onUpdateSuccess) onUpdateSuccess();
      }
    } catch (error) {
      console.error("Update failed:", error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || error.response.data.error;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to update time slot");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleDay = (day) => {
    const currentDays = values.applicable_days;
    if (currentDays.includes(day)) {
      setFieldValue(
        "applicable_days",
        currentDays.filter((d) => d !== day)
      );
    } else {
      setFieldValue("applicable_days", [...currentDays, day]);
    }
  };

  const selectAllDays = () => {
    setFieldValue(
      "applicable_days",
      days.map((d) => d.value)
    );
  };

  const removeSelectedDay = (day) => {
    setFieldValue(
      "applicable_days",
      values.applicable_days.filter((d) => d !== day)
    );
  };

  if (!selectedSlot || !slotDetails) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <motion.div
            className="background-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-dark-overlay w-full max-w-3xl rounded-2xl shadow-2xl p-8 z-10 overflow-y-auto max-h-[90vh]"
          >
            <button onClick={onClose} className="absolute right-4 top-4 x-btn">
              <X size={20} />
            </button>

            <h2 className="form-header text-xl font-bold mb-2">
              Edit Timeslot Details
            </h2>
            <p className="text-sm text-main-blue font-medium mb-6">
              Time Slot: {slotDetails.name}
            </p>

            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
                <p className="text-sub-text text-sm">Loading details...</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={formik.handleSubmit}>
                {/* LOCKED INFO SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border border-box-outline p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
                  <div>
                    <label className="form-title">Department Name</label>
                    <input
                      type="text"
                      value={slotDetails.department?.code || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed bg-white/50 dark:bg-black/20"
                    />
                    <p className="mt-0.5 text-xs text-sub-text">
                      Cannot be changed after creation
                    </p>
                  </div>
                  <div>
                    <label className="form-title">Semester Name</label>
                    <input
                      type="text"
                      value={slotDetails.semester?.semester_name || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed bg-white/50 dark:bg-black/20"
                    />
                  </div>
                  <div>
                    <label className="form-title">Batch Name</label>
                    <input
                      type="text"
                      value={slotDetails.batch?.name || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed bg-white/50 dark:bg-black/20"
                    />
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <label className="form-title">Time Slot Name</label>
                    <input
                      name="name"
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
                    <label className="form-title">Start Time</label>
                    <input
                      type="time"
                      name="start_time"
                      value={values.start_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.start_time && errors.start_time && (
                      <p className="showError">{errors.start_time}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-title">End Time</label>
                    <input
                      type="time"
                      name="end_time"
                      value={values.end_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.end_time && errors.end_time && (
                      <p className="showError">{errors.end_time}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-title">Slot Type</label>
                    <div className="flex gap-4 mt-2">
                      {["Lecture", "Practical", "Break"].map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-1 cursor-pointer form-radio-title"
                        >
                          <input
                            type="radio"
                            name="slot_type"
                            value={type}
                            checked={values.slot_type === type}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-radio"
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                    {touched.slot_type && errors.slot_type && (
                      <p className="showError">{errors.slot_type}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-title">Shift</label>
                    <div className="flex gap-4 mt-2">
                      {["Morning", "Day"].map((sh) => (
                        <label
                          key={sh}
                          className="flex items-center gap-2 cursor-pointer form-radio-title"
                        >
                          <input
                            type="radio"
                            name="shift"
                            value={sh}
                            checked={values.shift === sh}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-radio"
                          />
                          {sh}
                        </label>
                      ))}
                    </div>
                    {touched.shift && errors.shift && (
                      <p className="showError">{errors.shift}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-title">Active</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer form-radio-title">
                        <input
                          type="radio"
                          name="is_active"
                          value="true"
                          checked={values.is_active === true}
                          onChange={() => setFieldValue("is_active", true)}
                          className="form-radio"
                        />
                        True
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer form-radio-title">
                        <input
                          type="radio"
                          name="is_active"
                          value="false"
                          checked={values.is_active === false}
                          onChange={() => setFieldValue("is_active", false)}
                          className="form-radio"
                        />
                        False
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="form-title">Duration in Minutes</label>
                    <input
                      type="number"
                      name="duration_minutes"
                      value={values.duration_minutes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select"
                    />
                    {touched.duration_minutes && errors.duration_minutes && (
                      <p className="showError">{errors.duration_minutes}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="form-title">Applicable Days</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setApplicableDaysOpen(!applicableDaysOpen)}
                        className="dropdown-select w-full flex items-center justify-between"
                      >
                        <div className="flex gap-2 flex-wrap flex-1">
                          {values.applicable_days.length > 0 ? (
                            values.applicable_days.map((day) => (
                              <span
                                key={day}
                                className="inline-flex items-center gap-1 bg-main-blue text-white text-xs px-2 py-1 rounded-full"
                              >
                                {days.find((d) => d.value === day)?.label || day}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSelectedDay(day);
                                  }}
                                  className="hover:bg-blue-600 rounded-full p-0.5"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-sub-text">Select Days</span>
                          )}
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-black dark:text-white transition-transform ${
                            applicableDaysOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {applicableDaysOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-overlay border border-box-outline rounded-lg shadow-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-primary-text dark:text-white">
                              Working Days
                            </span>
                            <button
                              type="button"
                              onClick={selectAllDays}
                              className="px-3 py-1 bg-main-blue text-white rounded text-xs hover:bg-hover-blue"
                            >
                              Select All
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {days.map((day) => (
                              <label
                                key={day.value}
                                className="flex items-center gap-2 cursor-pointer text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={values.applicable_days.includes(day.value)}
                                  onChange={() => toggleDay(day.value)}
                                  className="form-radio"
                                />
                                <span className="text-primary-text dark:text-white">
                                  {day.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {touched.applicable_days && errors.applicable_days && (
                      <p className="showError">{errors.applicable_days}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between gap-4 items-center mt-10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="cancel-btn"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="auth-btn flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Changes"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TimeSlotEditModal;