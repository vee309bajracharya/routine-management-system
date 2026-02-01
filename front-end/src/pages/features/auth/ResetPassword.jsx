/* eslint-disable no-unused-vars */
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from "react";
import { useFormik } from 'formik';
import { ResetPasswordSchema } from '../../../validations/ForgotandResetValidationSchema';
import { toast } from 'react-toastify';
import axiosClient from "../../../services/api/axiosClient";

const ResetPassword = () => {

    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            token: token,
            email: searchParams.get('email') || "",
            password: "",
            password_confirmation: "",
        },
        validationSchema: ResetPasswordSchema,
        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                const response = await axiosClient.post('/auth/reset-password', values);
                toast.success('Password reset successfully');
                navigate('/teacher-login');
            } catch (error) {
                toast.error(error.response?.data?.message || "Something went wrong. Please retry again");
            } finally {
                setIsLoading(false);
            }
        },
    });


    return (
        <section className="bg-primary6-blue min-h-screen flex items-center justify-center font-general-sans">
            <div className="bg-white shadow-md rounded-2xl px-6 py-8 w-full max-w-sm">
                <h1 className="text-2xl font-bold text-center text-primary-text">Reset Password</h1>
                <form className="space-y-4 mt-6" onSubmit={formik.handleSubmit}>
                    {/* Email (Read Only - as retrieve from link) */}
                    <div>
                        <label className="block text-primary-text mb-1 font-medium">Email</label>
                        <input type="email" className="inputbox opacity-60" {...formik.getFieldProps('email')} readOnly />
                    </div>

                    {/* New Password */}
                    <div className="relative">
                        <label className="block text-primary-text mb-1 font-medium">New Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="inputbox" {...formik.getFieldProps('password')}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-10">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {formik.errors.password && formik.touched.password && <p className='showError'>{formik.errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <label className="block text-primary-text mb-1 font-medium">Confirm New Password</label>

                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="inputbox" {...formik.getFieldProps('password_confirmation')}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-10"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {formik.errors.password_confirmation && formik.touched.password_confirmation && <p className='showError'>{formik.errors.password_confirmation}</p>}
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} type="submit" className="auth-btn">
                        {isLoading ? <Loader2 className='animate-spin mx-auto w-6 h-6' /> : 'Reset Password'}
                    </motion.button>
                </form>
            </div>
        </section>);
};

export default ResetPassword