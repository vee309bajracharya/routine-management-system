/* eslint-disable no-unused-vars */
import React from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import { TimeSlotEditValidationSchema } from "../../validations/TimeSlotValidationSchema";
import axiosClient from "../../services/api/axiosClient";
import { toast } from "react-toastify";
import { useEffect } from "react";

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

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    resetForm,
  } = formik;

  useEffect(() => {
    const duration = calculateDuration(values.start_time, values.end_time);

    if (duration) {
      setFieldValue("duration_minutes", duration);
    } else {
      setFieldValue("duration_minutes", "");
    }
  }, [values.start_time, values.end_time]);

  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};

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
        updateData,
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Time slot updated successfully",
        );
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
        currentDays.filter((d) => d !== day),
      );
    } else {
      setFieldValue("applicable_days", [...currentDays, day]);
    }
  };

  const selectAllDays = () => {
    setFieldValue(
      "applicable_days",
      days.map((d) => d.value),
    );
  };

  const removeSelectedDay = (day) => {
    setFieldValue(
      "applicable_days",
      values.applicable_days.filter((d) => d !== day),
    );
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (endMinutes <= startMinutes) return "";
    return endMinutes - startMinutes;
  };

  if (!selectedSlot || !slotDetails) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <section className="editmodal-wrapper">
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
            className="editmodal-container max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="x-btn">
              <X size={20} />
            </button>
            <h2 className="form-header text-xl md:text-2xl pr-8">Edit Timeslot Details</h2>
            <p className="form-subtitle-info">{slotDetails.name}</p>

            {isLoadingDetails ? (
              <div className="state-container">
                <Loader2
                  size={40}
                  className="animate-spin text-main-blue mb-3"
                />
                <p className="state-text">Loading Details</p>
              </div>
            ) : (
              <form
                className="space-y-4 sm:space-y-6"
                onSubmit={formik.handleSubmit}
              >
                {/* LOCKED INFO SECTION */}
                <div className="read-only-grid">
                  <div>
                    <label className="form-title sm:text-sm" htmlFor="department">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={slotDetails.department?.code || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed text-sm"
                      id="department"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="form-title sm:text-sm" htmlFor="semester">
                      Semester Name
                    </label>
                    <input
                      type="text"
                      value={slotDetails.semester?.semester_name || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed text-sm"
                      id="semester"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="form-title sm:text-sm" htmlFor="batch">Batch Name</label>
                    <input
                      type="text"
                      value={slotDetails.batch?.name || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed text-sm"
                      id="batch"
                      autoComplete="off"
                    />
                  </div>
                  <p className="sm:col-span-3 read-only-text">
                    Cannot be changed after creation
                  </p>
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="form-title sm:text-sm" htmlFor="name">
                      Time Slot Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                      autoComplete="off"
                    />
                    {touched.name && errors.name && (
                      <p className="showError text-xs">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-title sm:text-sm" htmlFor="start_time">Start Time</label>
                    <input
                      type="time"
                      id="start_time"
                      name="start_time"
                      value={values.start_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                    />
                    {touched.start_time && errors.start_time && (
                      <p className="showError text-xs">{errors.start_time}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-title sm:text-sm" htmlFor="end_time">End Time</label>
                    <input
                      type="time"
                      id="end_time"
                      name="end_time"
                      value={values.end_time}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                    />
                    {touched.end_time && errors.end_time && (
                      <p className="showError text-xs">{errors.end_time}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <div className="form-title sm:text-sm">Slot Type</div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      {["Lecture", "Practical", "Break"].map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm"
                          htmlFor={`slot_type_${type}`}
                        >
                          <input
                            type="radio"
                            id={`slot_type_${type}`}
                            name="slot_type"
                            value={type}
                            checked={values.slot_type === type}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-radio"
                          />
                          <span className="form-radio-title">{type}</span>
                        </label>
                      ))}
                    </div>
                    {touched.slot_type && errors.slot_type && (
                      <p className="showError text-xs">{errors.slot_type}</p>
                    )}
                  </div>

                  <div>
                    <div className="form-title sm:text-sm">Shift</div>
                    <div className="flex gap-4 sm:gap-6 mt-2">
                      {["Morning", "Day"].map((sh) => (
                        <label key={sh} className="form-selection-label" htmlFor={`shift_${sh}`}>
                          <input
                            type="radio"
                            id={`shift_${sh}`}
                            name="shift"
                            value={sh}
                            checked={values.shift === sh}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-radio"
                          />
                          <span className="form-radio-title">{sh}</span>
                        </label>
                      ))}
                    </div>
                    {touched.shift && errors.shift && (
                      <p className="showError text-xs">{errors.shift}</p>
                    )}
                  </div>

                  <div>
                    <div className="form-title sm:text-sm">Active</div>
                    <div className="flex gap-4 sm:gap-6 mt-2">
                      <label className="form-selection-label" htmlFor={`is_active_true`}>
                        <input
                          type="radio"
                          id={`is_active_true`}
                          name="is_active"
                          value="true"
                          checked={values.is_active === true}
                          onChange={() => setFieldValue("is_active", true)}
                          className="form-radio"
                        />
                        <span className="form-radio-title">True</span>
                      </label>
                      <label className="form-selection-label" htmlFor={`is_active_false`}>
                        <input
                          type="radio"
                          id={`is_active_false`}
                          name="is_active"
                          value="false"
                          checked={values.is_active === false}
                          onChange={() => setFieldValue("is_active", false)}
                          className="form-radio"
                        />
                        <span className="form-radio-title">False</span>
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="form-title sm:text-sm" htmlFor={`duration_minutes`}>
                      Duration in Minutes
                    </label>
                    <input
                      type="number"
                      id={`duration_minutes`}
                      name="duration_minutes"
                      placeholder="Auto calculated"
                      value={values.duration_minutes}
                      disabled
                      className="dropdown-select bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-sm"
                    />
                    {touched.duration_minutes && errors.duration_minutes && (
                      <p className="showError text-xs">
                        {errors.duration_minutes}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <div className="form-title sm:text-sm">
                      Applicable Days
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setApplicableDaysOpen(!applicableDaysOpen)
                        }
                        className="dropdown-select w-full flex items-center justify-between text-sm"
                      >
                        <div className="flex gap-2 flex-wrap flex-1">
                          {values.applicable_days.length > 0 ? (
                            values.applicable_days.map((day) => (
                              <span
                                key={day}
                                className="inline-flex items-center gap-1 bg-main-blue text-white text-xs px-2 py-1 rounded-full"
                              >
                                {days.find((d) => d.value === day)?.label ||
                                  day}
                                <span
                                  type="button"
                                  role="button"
                                  className="hover:bg-blue-600 rounded-full p-0.5 cursor-pointer"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeSelectedDay(day);
                                    }
                                  }}
                                >
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="text-sub-text text-xs sm:text-sm">
                              Select Days
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-black dark:text-white cursor-pointer transition-transform ${applicableDaysOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {applicableDaysOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-overlay border border-box-outline rounded-lg shadow-lg p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs sm:text-sm font-medium text-primary-text dark:text-white">
                              Working Days
                            </span>
                            <button
                              type="button"
                              onClick={selectAllDays}
                              className="px-2 sm:px-3 py-1 bg-main-blue text-white rounded text-xs hover:bg-hover-blue cursor-pointer"
                            >
                              Select All
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {days.map((day) => (
                              <label
                                key={day.value}
                                className="form-selection-label"
                                htmlFor={`applicable_days_${day.value}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={values.applicable_days.includes(
                                    day.value,
                                  )}
                                  onChange={() => toggleDay(day.value)}
                                  className="form-radio"
                                  id={`applicable_days_${day.value}`}
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
                      <p className="showError text-xs">
                        {errors.applicable_days}
                      </p>
                    )}
                  </div>
                </div>

                <div className="modal-form-actions">
                  <button
                    type="button"
                    onClick={onClose}
                    className="modal-form-actions-cancel cancel-btn"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-form-actions-update auth-btn"
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
        </section>
      )}
    </AnimatePresence>
  );
};

export default TimeSlotEditModal;
