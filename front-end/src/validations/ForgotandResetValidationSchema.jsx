import * as Yup from "yup";

export const ForgotPasswordSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),
});

export const ResetPasswordSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),

    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[!@#$%^&*(),_>?":{}|<>]/, "Password must contain at least one symbol")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter"),

    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Password confirmation is required')
});