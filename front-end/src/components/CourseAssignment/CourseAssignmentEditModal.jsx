/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import { CourseAssignmentEditValidationSchema } from "../../validations/CourseAssignmentValidationSchema";
import axiosClient from "../../services/api/axiosClient";
import { toast } from "react-toastify";

const CourseAssignmentEditModal = ({
  isOpen,
  onClose,
  selectedAssignment,
  assignmentDetails,
  isLoadingDetails,
  onUpdateSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const formik = useFormik({
    initialValues: assignmentDetails
      ? {
          course_id: assignmentDetails.course?.id || "",
          teacher_id: assignmentDetails.teacher?.id || "",
          assignment_type: assignmentDetails.assignment_type || "Theory",
          status: assignmentDetails.status || "active",
          notes: assignmentDetails.notes || "",
        }
      : {
          course_id: "",
          teacher_id: "",
          assignment_type: "Theory",
          status: "active",
          notes: "",
        },
    validationSchema: CourseAssignmentEditValidationSchema,
    onSubmit: handleEditSubmit,
    enableReinitialize: true,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  useEffect(() => {
    if (!isOpen || !assignmentDetails) return;

    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await axiosClient.get("/admin/dropdowns/courses", {
          params: {
            department_id: assignmentDetails.department?.id,
            semester_id: assignmentDetails.semester?.id,
          },
        });
        if (response.data.success) {
          setCourses(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error(error.userMessage || "Failed to load courses");
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [isOpen, assignmentDetails]);

  useEffect(() => {
    if (!isOpen || !assignmentDetails) return;

    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await axiosClient.get(`/admin/dropdowns/teachers`);
        if (response.data.success) {
          setTeachers(response.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        toast.error(error.userMessage || "Failed to load teachers");
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [isOpen, assignmentDetails]);

  async function handleEditSubmit(values) {
    setIsSubmitting(true);
    try {
      const updateData = {};

      if (values.course_id !== assignmentDetails.course?.id)
        updateData.course_id = values.course_id;
      if (values.teacher_id !== assignmentDetails.teacher?.id)
        updateData.teacher_id = values.teacher_id;
      if (values.assignment_type !== assignmentDetails.assignment_type)
        updateData.assignment_type = values.assignment_type;
      if (values.status !== assignmentDetails.status)
        updateData.status = values.status;
      if (values.notes !== assignmentDetails.notes)
        updateData.notes = values.notes || null;

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosClient.put(
        `/admin/course-assignments/${assignmentDetails.id}`,
        updateData
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Course assignment updated successfully"
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
        toast.error(error.userMessage || "Failed to update assignment");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!selectedAssignment || !assignmentDetails) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="editmodal-wrapper">
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

            <h2 className="form-header text-xl md:text-2xl pr-8">
              Edit Course Assignment
            </h2>
            <p className="form-subtitle-info">
              Assignment ID: COAS-{String(assignmentDetails.id).padStart(3, "0")}
            </p>

            {isLoadingDetails ? (
              <div className="state-container">
                <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
                <p className="state-text">Loading details...</p>
              </div>
            ) : (
              <form className="space-y-4 sm:space-y-6" onSubmit={formik.handleSubmit}>
                {/* LOCKED INFO SECTION */}
                <div className="read-only-grid">
                  <div>
                    <label className="form-title sm:text-sm">Department</label>
                    <input
                      type="text"
                      value={assignmentDetails.department?.code || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="form-title sm:text-sm">Semester</label>
                    <input
                      type="text"
                      value={assignmentDetails.semester?.name || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="form-title sm:text-sm">Batch</label>
                    <input
                      type="text"
                      value={assignmentDetails.batch?.name || "N/A"}
                      disabled
                      className="dropdown-select cursor-not-allowed text-sm"
                    />
                  </div>
                  <p className="sm:col-span-3 read-only-text">
                    Cannot be changed after creation
                  </p>
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div>
                    <label className="form-title sm:text-sm">Course</label>
                    <select
                      name="course_id"
                      value={values.course_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                      disabled={isLoadingCourses}
                    >
                      <option value="">
                        {isLoadingCourses ? "Loading..." : "Select Course"}
                      </option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.display_label}
                        </option>
                      ))}
                    </select>
                    {touched.course_id && errors.course_id && (
                      <p className="showError text-xs">{errors.course_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-title sm:text-sm">Teacher</label>
                    <select
                      name="teacher_id"
                      value={values.teacher_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="dropdown-select text-sm"
                      disabled={isLoadingTeachers}
                    >
                      <option value="">
                        {isLoadingTeachers ? "Loading..." : "Select Teacher"}
                      </option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.display_label}
                        </option>
                      ))}
                    </select>
                    {touched.teacher_id && errors.teacher_id && (
                      <p className="showError text-xs">{errors.teacher_id}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-title sm:text-sm">Assignment Type</label>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                      {["Theory", "Practical", "Theory and Practical"].map((type) => (
                        <label
                          key={type}
                          className="form-selection-label"
                        >
                          <input
                            type="radio"
                            name="assignment_type"
                            value={type}
                            checked={values.assignment_type === type}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-radio"
                          />
                          <span className="form-radio-title">{type}</span>
                        </label>
                      ))}
                    </div>
                    {touched.assignment_type && errors.assignment_type && (
                      <p className="showError text-xs">{errors.assignment_type}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-title sm:text-sm">Status</label>
                    <div className="flex gap-4 sm:gap-6 mt-2">
                      {[
                        { value: "active", label: "Active" },
                        { value: "cancelled", label: "Cancelled" },
                      ].map((statusOption) => (
                        <label
                          key={statusOption.value}
                          className="form-selection-label"
                        >
                          <input
                            type="radio"
                            name="status"
                            value={statusOption.value}
                            checked={values.status === statusOption.value}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-radio"
                          />
                          <span className="form-radio-title">{statusOption.label}</span>
                        </label>
                      ))}
                    </div>
                    {touched.status && errors.status && (
                      <p className="showError text-xs">{errors.status}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-title sm:text-sm">Notes</label>
                    <textarea
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="textarea-input resize-none h-20 sm:h-24 text-sm"
                      placeholder="Add additional notes..."
                    />
                    {touched.notes && errors.notes && (
                      <p className="showError text-xs">{errors.notes}</p>
                    )}
                  </div>
                </div>

                <div className="modal-form-actions">
                  <button
                    type="button"
                    onClick={onClose}
                    className="cancel-btn px-4 text-sm order-2 sm:order-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="auth-btn px-4 flex items-center justify-center text-sm order-1 sm:order-2"
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

export default CourseAssignmentEditModal;