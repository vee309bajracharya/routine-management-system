/* eslint-disable react-refresh/only-export-components */
import * as Yup from 'yup';

export const InstitutionValidationSchema = Yup.object({

    institution_name: Yup.string()
        .required('Institution Name is required')
        .max(255)
        .trim(),

    type: Yup.string().oneOf(
        ['University', 'College', 'School', 'Institute']
    ),

    address: Yup.string()
        .max(50)
        .nullable(),

    contact_email: Yup.string()
        .email('Enter a valid email address'),
    
    contact_phone: Yup.string().max(15),

});