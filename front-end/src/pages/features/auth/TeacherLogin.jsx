/* eslint-disable no-unused-vars */
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const TeacherLogin = () => {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="bg-primary6-blue">
      <section className="wrapper min-h-screen flex flex-col items-center justify-center font-general-sans">

        {/* Login Container */}
        <div className="bg-white shadow-md rounded-2xl px-6 py-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-center text-primary-text">
            Teacher Login
          </h1>
          <p className="text-center text-primary-text mt-2 mb-6 text-base">
            Please enter your details
          </p>

          {/* Form */}
          <form className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor='email'
                className="block text-primary-text mb-1 font-medium">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                className="inputbox"
              />
            </div>

            {/* Password */}
            <div className='relative mb-3'>
              <label
                htmlFor='password'
                className="block text-primary-text mb-1 font-medium">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="inputbox"
                autoComplete='off'
              />
              <button
                type='button'
                aria-label='Password Toggle Button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-4 top-12 -translate-y-1/2 transition-base cursor-pointer'>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 bg-main-blue"
              />
              <label className="ml-2 text-gray-700 text-sm">Remember Me</label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="auth-btn"
              aria-label="Submit Button"
            >
              Submit
            </motion.button>
          </form>

          {/* Switch to teacher Login page */}
          <Link
            to="/admin-login"
            className="auth-role-link"
          >
            Login as Admin
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

export default TeacherLogin;
