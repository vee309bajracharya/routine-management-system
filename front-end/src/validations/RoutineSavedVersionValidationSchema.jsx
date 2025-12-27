/* eslint-disable react-refresh/only-export-components */
import * as Yup from 'yup';

export const RoutineSavedVersionValidationSchema = Yup.object({

    label: Yup.string()
        .required('Routine Label is required')
        .max(255, 'Title must not exceed 255 characters')
        .trim(),

    description: Yup.string()
        .max(500, 'Description must not exceed 500 characters')
        .trim(),
});

// initial values
export const RoutineSavedVersionInitialValues = {
    label: "",
    description: "",
};