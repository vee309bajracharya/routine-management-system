/* eslint-disable react-refresh/only-export-components */
import * as Yup from 'yup';

export const RoutineCreationValidationSchema = Yup.object({

    semester_id: Yup.string()
        .required('Semester is required'),

    batch_id: Yup.string()
        .required('Batch is required'),

    title: Yup.string()
        .required('Routine Title is required')
        .min(3, 'Title must be atleast 3 characters')
        .max(255, 'Title must not exceed 255 characters')
        .trim(),

    description: Yup.string()
        .max(1000, 'Description must not exceed 1000 characters')
        .trim(),

    effective_from: Yup.date()
        .required('Effective From date is required')
        .typeError('Invalid date format'),

    effective_to: Yup.date()
        .required('Effective To date is required')
        .typeError('Invalid date format')
        .min(
            Yup.ref('effective_from'),
            'Effective To date must be after Effective From date'
        ),
});

/**
 * Initial values for Routine Creation Form
 */
export const RoutineCreationInitialValues = {
    semester_id: "",
    batch_id: "",
    title: "",
    description: "",
    effective_from: "",
    effective_to: "",
};