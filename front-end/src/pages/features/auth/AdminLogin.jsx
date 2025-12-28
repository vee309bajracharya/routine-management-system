/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { Eye, EyeOff, ChevronLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import { LoginValidationSchema, LoginInitialValues } from '../../../validations/LoginValidationSchema';
import { useFormik } from 'formik';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet";
import Loader from "../../../components/common/Loader";

const AdminLogin = () => {

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: LoginInitialValues,
    validationSchema: LoginValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const response = await login(values.email, values.password, "admin", rememberMe);

        if (response.success) {
          toast.success('Login successful');
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { values, errors, handleBlur, handleSubmit, handleChange, touched } = formik;

  if (isAuthenticated) return <Loader />;

  return (
    <section className="bg-primary6-blue">

      <Helmet>
        <title>Admin Login - Routine Management System</title>
        <meta name="description" content="Admin Login page for Routine Management System" />
      </Helmet>

      <section className="wrapper min-h-screen flex flex-col items-center justify-center font-general-sans">
        <div
          data-aos="zoom-in"
          data-aos-duration="4000"
          className="bg-white shadow-md rounded-2xl px-6 py-8 w-full max-w-sm">

          <h1 className="text-2xl font-bold text-center text-primary-text">
            Admin Login
          </h1>
          <p className="text-center text-primary-text mt-2 mb-6 text-base">
            Please enter your details
          </p>

          {/* form starts here */}
          <form
            className="space-y-4"
            onSubmit={handleSubmit}>
            <div>
              {/* email */}
              <label
                className="block text-primary-text mb-1 font-medium"
                htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                className="inputbox"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
              />
              {errors.email && touched.email && (
                <p className='showError'>{errors.email}</p>
              )}
            </div>

            {/* password */}
            <div className="relative mb-3">
              <label
                htmlFor="password"
                className="block text-primary-text mb-1 font-medium">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                className="inputbox"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
              />
              <button
                type="button"
                aria-label="Password Toggle Button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-12 -translate-y-1/2 transition-base cursor-pointer">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && touched.password && (
                <p className='showError'>{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div
              className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 bg-main-blue"
                id='remember'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label
                htmlFor='remember'
                className="ml-2 text-gray-700 text-sm">Remember Me</label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="auth-btn"
            >
              {isLoading ? <Loader2 className='animate-spin mx-auto w-6 h-6' /> : 'Submit'}

            </motion.button>
          </form>

          {/* Switch Login Link */}
          <Link
            to="/teacher-login"
            className="auth-role-link"
          >
            Login as Teacher
          </Link>

        </div>

        {/* link to home-page */}
        <section className="flex justify-center mt-6">
          <Link
            to='/'
            className="back-page-link"
          >
            <span className="mr-1 text-lg">
              <ChevronLeft size={16} />
            </span> Back to Home Page
          </Link>
        </section>

      </section>
    </section>

  );
};

export default AdminLogin;
