/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { ForgotPasswordSchema } from "../../../validations/ForgotandResetValidationSchema"
import { Helmet } from "react-helmet"
import { useFormik } from "formik"
import axiosClient from "../../../services/api/axiosClient"


const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: ""
    },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values, actions) => {
      try {
        setIsLoading(true);
        const response = await axiosClient.post('/auth/forgot-password', values);
        toast.success(response.data.message || "Password reset link sent to your mail");
        actions.resetForm();
      } catch (error) {
        toast.error(error.userMessage || "Failed to send reset link");
      } finally {
        setIsLoading(false);
      }
    },
  });


  return (
    <section className="bg-primary6-blue">
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>

      <section className="wrapper min-h-screen flex flex-col items-center justify-center font-general-sans">
        <motion.div
          data-aos="zoom-in"
          className="bg-white shadow-md rounded-2xl px-6 py-8 w-full max-w-sm">

          <h1 className="text-2xl font-bold text-center text-primary-text">Forgot Password?</h1>
          <p className="text-center text-primary-text mt-2 mb-6 text-sm">
            Enter the email address associated with your account to receive password reset link
          </p>

          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            <div>
              <label className="block text-primary-text mb-1 font-medium" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="inputbox" {...formik.getFieldProps('email')}
                autoComplete="off"
              />
              {formik.errors.email && formik.touched.email && <p className='showError'>{formik.errors.email}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="auth-btn">
              {isLoading ? <Loader2 className='animate-spin mx-auto w-6 h-6' /> : 'Send Reset Link'}
            </motion.button>
          </form>

          <Link to="/teacher-login" className="auth-role-link text-center block mt-4">Back to Login</Link>
        </motion.div>
      </section>
    </section>
  );
};

export default ForgotPassword