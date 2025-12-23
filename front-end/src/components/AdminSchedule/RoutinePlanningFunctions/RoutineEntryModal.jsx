import { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useRoutineEntryModal } from "../../../contexts/RoutineEntryContext";
import { useRoutine } from "../../../contexts/RoutineContext";
import { RoutineEntryValidationSchema, RoutineEntryInitialValues } from "../../../validations/RoutineEntryValidationSchema";
import { useAuth } from "../../../contexts/AuthContext";
import axiosClient from "../../../services/api/axiosClient";


const RoutineEntryModal = () => {

    // from contexts
    const { currentRoutine, addRoutineEntry } = useRoutine();
    const { isModalOpen, selectedCell, closeModal, sessionState, setSessionState } = useRoutineEntryModal();
    const { user } = useAuth();

    // for dropdowns
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [batches, setBatches] = useState([]);
    const [courseAssignments, setCourseAssignments] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // get session state for current routine
    const currentSession = currentRoutine?.id ? sessionState[currentRoutine.id] : null;
    const lockedRoomId = currentSession?.lockedRoom || null;

    // formik setup
    const formik = useFormik({
        initialValues: RoutineEntryInitialValues,
        validationSchema: RoutineEntryValidationSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    const { values, errors, touched, handleBlur, handleChange, setFieldValue, setValues, setTouched, isValid } = formik;

    // helper methods
    const setLoadingState = useCallback((key, value) => {
        setLoading((prev) => ({ ...prev, [key]: value }));
    }, []);

    const fetchDropdown = useCallback(async (key, apiCall, setter) => {
        setLoadingState(key, true);
        try {
            const res = await apiCall();
            if (res?.data?.success) {
                setter(res.data.data || []);
            }
        } catch (error) {
            console.error(`Failed to fetch ${key}: `, error);
            toast.error(error.userMessage || `Failed to load ${key}`);
        } finally {
            setLoadingState(key, false);
        }
    }, [setLoadingState]);


    // API fetch methods
    const fetchDepartments = useCallback(() => {
        if (!user?.institution_id) return;
        fetchDropdown('departments', () => axiosClient.get(`/admin/dropdowns/departments/${user.institution_id}`), setDepartments);
    }, [fetchDropdown, user?.institution_id]);

    const fetchAcademicYears = useCallback((departmentId) => {
        fetchDropdown('academicYears', () => axiosClient.get(`/admin/dropdowns/academic-years?department_id=${departmentId}`), setAcademicYears);
    }, [fetchDropdown]);

    const fetchSemesters = useCallback((academicYearId) => {
        fetchDropdown('semesters', () => axiosClient.get(`/admin/dropdowns/semesters?academic_year_id=${academicYearId}`), setSemesters);
    }, [fetchDropdown]);

    const fetchBatches = useCallback((departmentId, semesterId) => {
        fetchDropdown('batches', () => axiosClient.get(`/admin/dropdowns/batches?department_id=${departmentId}&semester_id=${semesterId}`), setBatches);
    }, [fetchDropdown]);

    const fetchCourseAssignments = useCallback((semesterId, batchId) => {
        fetchDropdown('courseAssignments', () => axiosClient.get(`/admin/dropdowns/course-assignments?semester_id=${semesterId}&batch_id=${batchId}`), setCourseAssignments);
    }, [fetchDropdown]);

    const fetchRooms = useCallback(() => {
        fetchDropdown('rooms', () => axiosClient.get(`/admin/dropdowns/rooms`), setRooms);
    }, [fetchDropdown]);

    const fetchTimeSlots = useCallback((batchId, semesterId, shift) => {
        fetchDropdown("timeSlots", () => axiosClient.get(`/admin/dropdowns/time-slots?batch_id=${batchId}&semester_id=${semesterId}&shift=${shift}`), setTimeSlots);
    }, [fetchDropdown]);

    // modal setup 
    useEffect(() => {
        if (!isModalOpen || !selectedCell || !currentRoutine) return;

        //check if session state exists for current routine
        if (currentSession?.formValues) {
            // saved session values
            setValues({
                ...currentSession.formValues,
                day_of_week: selectedCell.day,
                shift: currentRoutine.batch?.shift || 'Morning',
            });
        } else {
            // no saved session - newly open modal
            setValues({
                ...RoutineEntryInitialValues,
                day_of_week: selectedCell.day,
                shift: currentRoutine.batch?.shift || 'Morning',
            });
        }
        // fetch dropdowns
        if (user?.institution_id) {
            fetchDepartments();
            fetchRooms();
        }
    }, [isModalOpen, selectedCell, currentRoutine]);

    // Lock room after first selection (per routine)
    useEffect(() => {
        if (!currentRoutine?.id || !values.room_id) return;

        // if room is selected and not locked yet, lock it
        if (values.room_id && !lockedRoomId) {
            setSessionState(prev => ({
                ...prev,
                [currentRoutine.id]: { ...prev[currentRoutine.id], lockedRoom: values.room_id }
            }));
        }
    }, [values.room_id, currentRoutine?.id, lockedRoomId]);


    // cascading effects
    useEffect(() => {
        if (!values.department_id) {
            setAcademicYears([]);
            setFieldValue('academic_year_id', '');
            return;
        }
        fetchAcademicYears(values.department_id);
    }, [values.department_id]);

    useEffect(() => {
        if (!values.academic_year_id) {
            setSemesters([]);
            setFieldValue("semester_id", '');
            return;
        }
        fetchSemesters(values.academic_year_id);
    }, [values.academic_year_id]);

    useEffect(() => {
        if (!values.department_id || !values.semester_id) {
            setBatches([]);
            setFieldValue("batch_id", '');
            return;
        }
        fetchBatches(values.department_id, values.semester_id);
    }, [values.department_id, values.semester_id]);

    useEffect(() => {
        if (!values.semester_id || !values.batch_id) {
            setCourseAssignments([]);
            setFieldValue("course_assignment_id", '');
            return;
        }
        fetchCourseAssignments(values.semester_id, values.batch_id);
    }, [values.semester_id, values.batch_id]);

    useEffect(() => {
        if (!values.batch_id || !values.semester_id || !values.shift) {
            setTimeSlots([]);
            setFieldValue("time_slot_id", '');
            return;
        }
        fetchTimeSlots(values.batch_id, values.semester_id, values.shift);
    }, [values.batch_id, values.semester_id, values.shift]);


    // handle form submission
    async function handleSubmit(values) {
        if (!currentRoutine?.id) {
            toast.error('No routine selected');
            return;
        }

        setIsSubmitting(true);
        try {
            await addRoutineEntry({
                routine_id: currentRoutine.id,
                course_assignment_id: values.course_assignment_id,
                room_id: values.room_id,
                time_slot_id: values.time_slot_id,
                day_of_week: values.day_of_week,
                shift: values.shift,
                entry_type: values.entry_type,
                notes: values.notes || "",
            });

            const sessionValues = {
                // save fields
                department_id: values.department_id,
                academic_year_id: values.academic_year_id,
                semester_id: values.semester_id,
                batch_id: values.batch_id,
                room_id: values.room_id,
                shift: values.shift,
                day_of_week: values.day_of_week,

                // reset fields
                course_assignment_id: '',
                time_slot_id: '',
                entry_type: 'Lecture', // Reset to default
                notes: '',
            };

            // save to session state
            setSessionState(prev=>({
                ...prev,
                [currentRoutine.id] : {
                    formValues : sessionValues,
                    lockedRoom: values.room_id
                }
            }));
            setValues(sessionValues); // update form with reset values
            setTouched({});
        } catch (error) {
            console.error('Failed to add entry:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // handle modal close
    const handleClose = () => {
        setTouched({});
        closeModal();
    };

    if (!isModalOpen) return null;

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-overlay rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">

                {/* Create Routine Entry - Header */}
                <div className="sticky top-0 bg-white dark:bg-dark-overlay border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-semibold text-primary-text dark:text-white">
                        Create Routine Entry
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                {/* Create Routine Entry - Body */}
                <form
                    onSubmit={formik.handleSubmit}
                    className="p-6">
                    <section className="grid grid-cols-2 gap-4">

                        {/* Department */}
                        <div>
                            <label
                                htmlFor="department"
                                className="form-label">Department <span className="text-error-red">*</span></label>
                            <select
                                name="department_id"
                                value={values.department_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={loading.departments}
                                className="dropdown-select">
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.display_label}
                                    </option>
                                ))}
                            </select>
                            {touched.department_id && errors.department_id && (
                                <p className="showError">{errors.department_id}</p>
                            )}
                        </div>

                        {/* Academic Year */}
                        <div>
                            <label
                                htmlFor="academicYear"
                                className="form-label">Academic Year <span className="text-error-red">*</span></label>
                            <select
                                name="academic_year_id"
                                value={values.academic_year_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!values.department_id || loading.academicYears}
                                className="dropdown-select">
                                <option value="">
                                    {!values.department_id ? "Select Department first" : "Select Academic Year"}
                                </option>
                                {academicYears.map((year) => (
                                    <option key={year.id} value={year.id}>
                                        {year.display_label}
                                    </option>
                                ))}
                            </select>
                            {touched.academic_year_id && errors.academic_year_id && (
                                <p className="showError">{errors.academic_year_id}</p>
                            )}
                        </div>

                        {/* Semester */}
                        <div>
                            <label
                                htmlFor="semester"
                                className="form-label">Semester <span className="text-error-red">*</span></label>
                            <select
                                name="semester_id"
                                value={values.semester_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!values.academic_year_id || loading.semesters}
                                className="dropdown-select">
                                <option value="">
                                    {!values.academic_year_id ? "Select Academic Year first" : "Select Semester"}
                                </option>
                                {semesters.map((sem) => (
                                    <option key={sem.id} value={sem.id}>
                                        {sem.display_label}
                                    </option>
                                ))}
                            </select>
                            {touched.semester_id && errors.semester_id && (
                                <p className="showError">{errors.semester_id}</p>
                            )}
                        </div>

                        {/* Batch */}
                        <div>
                            <label
                                htmlFor="batch"
                                className="form-label">Batch <span className="text-error-red">*</span></label>
                            <select
                                name="batch_id"
                                value={values.batch_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={!values.department_id || !values.semester_id || loading.batches}
                                className="dropdown-select">
                                <option value="">
                                    {!values.semester_id ? "Select Semester first" : "Select Batch"}
                                </option>
                                {batches.map((batch) => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.display_label}
                                    </option>
                                ))}
                            </select>
                            {touched.batch_id && errors.batch_id && (
                                <p className="showError">{errors.batch_id}</p>
                            )}
                        </div>

                        {/* Shift */}
                        <div>
                            <label htmlFor="shift" className="form-label">Shift <span className="text-error-red">*</span></label>
                            <input
                                type="text"
                                name="shift"
                                value={values.shift}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-primary-text dark:text-white cursor-not-allowed" />
                        </div>

                        {/* Course Assignment */}
                        <div>
                            <label
                                htmlFor="courseAssignment"
                                className="form-label">Course Assignment <span className="text-error-red">*</span></label>
                            <select
                                name="course_assignment_id"
                                value={values.course_assignment_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={
                                    !values.semester_id ||
                                    !values.batch_id ||
                                    loading.courseAssignments
                                }
                                className="dropdown-select">
                                <option value="">Select Course Assignment</option>
                                {courseAssignments.map((assignment) => (
                                    <option key={assignment.id} value={assignment.id}>
                                        {assignment.display_label}
                                    </option>
                                ))}
                            </select>
                            {touched.course_assignment_id && errors.course_assignment_id && (
                                <p className="showError">
                                    {errors.course_assignment_id}
                                </p>
                            )}
                        </div>

                        {/* Room - locked per routine */}
                        <div>
                            <label htmlFor="room" className="form-label">Room <span className="text-error-red">*</span></label>
                            <select
                                name="room_id"
                                value={values.room_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={loading.rooms || lockedRoomId !== null}
                                className="dropdown-select"
                            >
                                <option value="">Select Room</option>
                                {rooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.display_label}
                                    </option>
                                ))}
                            </select>
                            {touched.room_id && errors.room_id && (
                                <p className="showError">{errors.room_id}</p>
                            )}
                            {lockedRoomId && (
                                <span className="text-xs text-sub-text mt-1 px-3">
                                    Room is locked for this routine
                                </span>
                            )}
                        </div>

                        {/* Time Slot */}
                        <div>
                            <label htmlFor="timeSlot" className="form-label">Time Slot <span className="text-error-red">*</span>
                            </label>
                            <select
                                name="time_slot_id"
                                value={values.time_slot_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={
                                    !values.batch_id ||
                                    !values.semester_id ||
                                    !values.shift ||
                                    loading.timeSlots
                                }
                                className="dropdown-select"
                            >
                                <option value="">Select Time Slot</option>
                                {timeSlots.map((slot) => (
                                    <option key={slot.id} value={slot.id}>
                                        {slot.display_label}
                                    </option>
                                ))}
                            </select>
                            {touched.time_slot_id && errors.time_slot_id && (
                                <p className="showError">{errors.time_slot_id}</p>
                            )}
                        </div>

                        {/* Day */}
                        <div>
                            <label htmlFor="day" className="form-label"> Day <span className="text-error-red">*</span>
                            </label>
                            <input
                                type="text"
                                name="day_of_week"
                                value={values.day_of_week}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-primary-text dark:text-white cursor-not-allowed"
                            />
                        </div>

                        {/* Entry Type */}
                        <div>
                            <label htmlFor="entryType" className="form-label">Entry Type <span className="text-error-red">*</span>
                            </label>
                            <select
                                name="entry_type"
                                value={values.entry_type}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-hover text-primary-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Lecture">Lecture</option>
                                <option value="Practical">Practical</option>
                            </select>
                            {touched.entry_type && errors.entry_type && (
                                <p className="showError">{errors.entry_type}</p>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="col-span-2">
                            <label htmlFor="notes" className="form-label">
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={values.notes}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                rows={3}
                                placeholder="Add any additional notes"
                                className="dropdown-select resize-none"
                            />
                            {touched.notes && errors.notes && (
                                <p className="showError">{errors.notes}</p>
                            )}
                        </div>
                    </section>
                    {/* Modal Footer */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-primary-text dark:text-white hover:bg-gray-50 dark:hover:bg-dark-hover transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 cursor-pointer"
                        >
                            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                            {isSubmitting ? "Adding Entry..." : "Add Entry"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default RoutineEntryModal