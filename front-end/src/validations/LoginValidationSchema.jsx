/* eslint-disable react-refresh/only-export-components */
import * as Yup from 'yup';

export const LoginValidationSchema = Yup.object({

    email: Yup.string()
        .email('Enter a valid email address')
        .required('Email is required')
        .trim(),
    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[!@#$%^&*(),_>?":{}|<>]/, "Password must contain at least one symbol")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter"),
});

export const LoginInitialValues = {
  email: "",
  password: "",
};