import { useEffect, useState, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useRoutineEntryModal } from "../../../contexts/RoutineEntryContext";
import { useRoutine } from "../../../contexts/RoutineContext";
import { RoutineEntryValidationSchema } from "../../../validations/RoutineEntryValidationSchema";
import axiosClient from "../../../services/api/axiosClient";

const RoutineEntryEditModal = () => {
    const { isModalOpen, modalMode, entryToUpdate, closeModal } = useRoutineEntryModal();
    const { currentRoutine, currentShift, updateRoutineEntry, deleteRoutineEntry, fetchRoutineGrid } = useRoutine();

    const [courseAssignments, setCourseAssignments] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Only validate editable fields
    const editableValidationSchema = RoutineEntryValidationSchema.pick([
        'course_assignment_id',
        'time_slot_id',
        'entry_type',
        'notes'
    ]);

    const formik = useFormik({
        initialValues: {
            course_assignment_id: "",
            time_slot_id: "",
            entry_type: "Lecture",
            notes: "",
        },
        validationSchema: editableValidationSchema,
        onSubmit: handleUpdate,
        enableReinitialize: true,
    });

    const { values, errors, touched, handleChange, handleBlur, setValues } = formik;

    // pre-fill with existing entry data
    useEffect(() => {
        if (!entryToUpdate || modalMode !== "update" || !isModalOpen) return;

        setValues({
            course_assignment_id: entryToUpdate.course_assignment_id || "",
            time_slot_id: entryToUpdate.time_slot_id || "",
            entry_type: entryToUpdate.entry_type || "Lecture",
            notes: entryToUpdate.notes || "",
        });
    }, [entryToUpdate, modalMode, isModalOpen, setValues]);

    // fetch only editable dropdowns
    const fetchEditableDropdowns = useCallback(async () => {
        if (!entryToUpdate?.course_assignment) {
            console.error("Missing course_assignment: ", entryToUpdate);
            toast.error("Invalid entry data");
            return;
        }

        try {
            setIsLoading(true);

            const semesterId = entryToUpdate.course_assignment.semester_id;
            const batchId = entryToUpdate.course_assignment.batch_id;
            const shift = entryToUpdate.course_assignment.batch.shift;

            if (!semesterId || !batchId || !shift) {
                console.error("Missing required IDs: ", { semesterId, batchId, shift });
                toast.error("Invalid entry structure");
                return;
            }

            // fetch both in parallel
            const [courseAssignmentResponse, timeSlotsResponse] = await Promise.all([
                axiosClient.get(
                    `/admin/dropdowns/course-assignments?semester_id=${semesterId}&batch_id=${batchId}`
                ),
                axiosClient.get(
                    `/admin/dropdowns/time-slots?batch_id=${batchId}&semester_id=${semesterId}&shift=${shift}`
                ),
            ]);

            // handle course assignments response
            if (courseAssignmentResponse.data?.success) {
                setCourseAssignments(courseAssignmentResponse.data.data || []);
            } else {
                console.error("Course assignments fetch failed: ", courseAssignmentResponse.data);
                toast.error("Failed to load course assignments");
            }

            // Handle time slots response
            if (timeSlotsResponse.data?.success) {
                setTimeSlots(timeSlotsResponse.data.data || []);
            } else {
                console.error("Time slots fetch failed: ", timeSlotsResponse.data);
                toast.error("Failed to load time slots");
            }
        } catch (error) {
            console.error("Fetch dropdowns error: ", error);
            toast.error("Failed to load options");
        } finally {
            setIsLoading(false);
        }
    }, [entryToUpdate]);

    // fetch dropdowns on modal open
    useEffect(() => {
        if (isModalOpen && modalMode === "update") {
            fetchEditableDropdowns();
        }
    }, [isModalOpen, modalMode, fetchEditableDropdowns]);

    // handle update
    async function handleUpdate(values) {
        if (!entryToUpdate?.id || !currentRoutine?.id) {
            toast.error("Missing entry or routine information");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateRoutineEntry(entryToUpdate.id, values);
            await fetchRoutineGrid(currentRoutine.id, currentShift, true);
            closeModal();
        } catch (error) {
            console.error("Update failed: ", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // delete with confirmation toast
    const handleDelete = () => {
        toast(
            ({ closeToast }) => (
                <section className="font-general-sans">
                    {/* title */}
                    <span className="font-semibold text-md mb-2 text-error-red">Delete this entry ?</span>

                    {/* Description */}
                    <p className="text-xs mb-3 mt-2 text-sub-text">
                        This action will delete the selected routine entry.
                        An undo option will be available for a few seconds after deletion.
                    </p>

                    {/* action btn */}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => closeToast()}
                            className="px-3 py-1 bg-box-outline text-primary-text cursor-pointer rounded-md transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                closeToast();
                                await handleConfirmDelete();
                            }}
                            className="px-3 py-1 cursor-pointer rounded-md bg-error-red hover:bg-red-700 text-white transition"
                        >
                            Delete
                        </button>
                    </div>
                </section>
            ), {
            closeButton: false,
            hideProgressBar: true,
            autoClose: false,
        });
    };

    // Confirm delete and show undo
    const handleConfirmDelete = async () => {
        if (!entryToUpdate?.id || !currentRoutine?.id) {
            toast.error("Missing entry or routine information");
            return;
        }

        try {
            await deleteRoutineEntry(entryToUpdate.id, currentRoutine.id, currentShift);
            closeModal();

            // Show undo notification
            toast.warning(({ closeToast }) => (
                <section className="flex items-center justify-between font-general-sans w-full">
                    <span className="font-medium">Entry deleted</span>
                    <div className="flex gap-3 ml-4">
                        <button
                            onClick={() => handleUndo(entryToUpdate.id, closeToast)}
                            className="text-main-blue hover:text-mouse-pressed-blue font-medium text-sm cursor-pointer"
                        >
                            Undo
                        </button>
                        <button
                            onClick={() => closeToast()}
                            className="text-gray-500 hover:text-gray-700 text-sm ml-5 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </section>
            ), {
                autoClose: 5000,
                closeButton: false,
                position: 'bottom-center',
            });
        } catch (error) {
            console.error("Delete failed : ", error);
        }
    };

    // Restore deleted entry
    const handleUndo = async (entryId, closeToast) => {
        if (!currentRoutine?.id) {
            toast.error("Missing routine information");
            return;
        }

        try {
            const response = await axiosClient.post(`/admin/routine-entries/${entryId}/restore`);

            if (response.data.success) {
                await fetchRoutineGrid(currentRoutine.id, currentShift, true);
                toast.success("Entry restored successfully");
            }
        } catch (error) {
            console.error("Restore failed: ", error);
            toast.error("Failed to restore entry");
        } finally {
            closeToast();
        }
    };

    // Only show in update mode
    if (!isModalOpen || modalMode !== "update" || !entryToUpdate) return null;

    // course_assignment - parent entity
    const courseAssignment = entryToUpdate.course_assignment;

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-overlay rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-dark-overlay border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-semibold text-primary-text dark:text-white">
                        Edit Routine Entry
                    </h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">

                    {/* read-only reference info */}
                    <section className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md max-w-3xl">
                        <div className="grid grid-cols-2 gap-3 text-sm text-sub-text dark:text-gray-400">
                            <div>
                                <span className="edit-form-info-span">Department</span>
                                <p className="edit-form-info-p">
                                    {courseAssignment?.batch?.department?.display_label || "N/A"}
                                </p>
                            </div>
                            <div>
                                <span className="edit-form-info-span">Semester</span>
                                <p className="edit-form-info-p">
                                    {courseAssignment?.semester?.display_label || "N/A"}
                                </p>
                            </div>
                            <div>
                                <span className="edit-form-info-span">Batch</span>
                                <p className="edit-form-info-p">
                                    {courseAssignment?.batch?.display_label || "N/A"}
                                </p>
                            </div>
                            <div>
                                <span className="edit-form-info-span">Room</span>
                                <p className="edit-form-info-p">
                                    {entryToUpdate.room?.display_label || "N/A"}
                                </p>
                            </div>
                            <div>
                                <span className="edit-form-info-span">Day</span>
                                <p className="edit-form-info-p">
                                    {entryToUpdate.day_of_week}
                                </p>
                            </div>
                            <div>
                                <span className="edit-form-info-span">Shift</span>
                                <p className="edit-form-info-p">
                                    {courseAssignment?.batch?.shift}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* editable fields */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary-text dark:text-white">
                            Edit Fields
                        </h3>

                        <section className="grid grid-cols-2 gap-4">
                            {/* Course Assignment */}
                            <div>
                                <label htmlFor="course_assignment_id" className="form-label">
                                    Course Assignment <span className="text-error-red">*</span>
                                </label>
                                <select
                                    name="course_assignment_id"
                                    value={values.course_assignment_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isLoading}
                                    className="dropdown-select"
                                >
                                    <option value="">Select Course Assignment</option>
                                    {courseAssignments.map((courseAssign) => (
                                        <option key={courseAssign.id} value={courseAssign.id}>
                                            {courseAssign.display_label}
                                        </option>
                                    ))}
                                </select>
                                {touched.course_assignment_id && errors.course_assignment_id && (
                                    <p className="showError">{errors.course_assignment_id}</p>
                                )}
                                {isLoading && <p className="text-xs text-sub-text mt-1">Loading...</p>}
                            </div>

                            {/* Time Slot */}
                            <div>
                                <label htmlFor="time_slot_id" className="form-label">
                                    Time Slot <span className="text-error-red">*</span>
                                </label>
                                <select
                                    name="time_slot_id"
                                    value={values.time_slot_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isLoading}
                                    className="dropdown-select"
                                >
                                    <option value="">Select Time Slot</option>
                                    {timeSlots.map((ts) => (
                                        <option key={ts.id} value={ts.id}>
                                            {ts.display_label}
                                        </option>
                                    ))}
                                </select>
                                {touched.time_slot_id && errors.time_slot_id && (
                                    <p className="showError">{errors.time_slot_id}</p>
                                )}
                                {isLoading && <p className="text-xs text-sub-text mt-1">Loading...</p>}
                            </div>

                            {/* Entry Type */}
                            <div>
                                <label htmlFor="entry_type" className="form-label">
                                    Entry Type <span className="text-error-red">*</span>
                                </label>
                                <select
                                    name="entry_type"
                                    value={values.entry_type}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="dropdown-select"
                                >
                                    <option value="Lecture">Lecture</option>
                                    <option value="Practical">Practical</option>
                                </select>
                                {touched.entry_type && errors.entry_type && (
                                    <p className="showError">{errors.entry_type}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label htmlFor="notes" className="form-label">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    name="notes"
                                    value={values.notes}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    rows={1}
                                    placeholder="Add additional notes"
                                    className="dropdown-select resize-none"
                                />
                                {touched.notes && errors.notes && (
                                    <p className="showError">{errors.notes}</p>
                                )}
                            </div>
                        </section>
                    </section>

                    {/* Footer */}
                    <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* delete */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-error-red text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            Delete Entry
                        </button>

                        {/* Cancel and Update */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-primary-text dark:text-white hover:bg-gray-50 dark:hover:bg-dark-hover transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="px-6 py-2 bg-main-blue text-white rounded-md hover:bg-mouse-pressed-blue disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 cursor-pointer"
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                {isSubmitting ? "Updating..." : "Update Entry"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default RoutineEntryEditModal;