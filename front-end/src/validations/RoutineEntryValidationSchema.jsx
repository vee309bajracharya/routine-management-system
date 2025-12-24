/* eslint-disable react-refresh/only-export-components */
import * as Yup from 'yup';

export const RoutineEntryValidationSchema = Yup.object({

    department_id: Yup.string()
        .required('Department is required'),

    academic_year_id: Yup.string()
        .required('Academic Year is required'),

    semester_id: Yup.string()
        .required('Semester is required'),

    batch_id: Yup.string()
        .required('Batch is required'),

    course_assignment_id: Yup.string()
        .required('Course Assignment is required'),

    room_id: Yup.string()
        .required('Room is required'),

    time_slot_id: Yup.string()
        .required('Time Slot is required'),

    day_of_week: Yup.string()
        .required('Day is required')
        .oneOf(
            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),

    shift: Yup.string()
        .required('Shift is required')
        .oneOf(['Morning', 'Day']),

    entry_type: Yup.string()
        .required('Entry Type is required')
        .oneOf(['Lecture', 'Practical']),

    notes: Yup.string()
        .max(500, 'Notes must not exceed 500 characters')
        .trim(),
});

// initial values
export const RoutineEntryInitialValues = {
    department_id: "",
    academic_year_id: "",
    semester_id: "",
    batch_id: "",
    course_assignment_id: "",
    room_id: "",
    time_slot_id: "",
    day_of_week: "",
    shift: "",
    entry_type: "Lecture", // default : Lecture
    notes: "",
};