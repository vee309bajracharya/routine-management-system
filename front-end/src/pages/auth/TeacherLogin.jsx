import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const TeacherLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Remember:", remember);
  };
  let navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white shadow-md rounded-2xl px-6 py-8 w-full max-w-sm">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-primary-text">
          Teacher Login
        </h1>
        <p className="text-center text-primary-text mt-2 mb-6 text-base">
          Please enter your details
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-primary-text mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inputbox"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-primary-text mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inputbox"
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="w-4 h-4 bg-main-blue"
            />
            <label className="ml-2 text-gray-700 text-sm">Remember me</label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-main-blue transition-all duration-200"
          >
            Submit
          </button>
        </form>

        {/* Switch Login Link */}
        <Link
          to="/AdminLogin"
          className="block text-center mt-5 text-main-blue hover:underline cursor-pointer"
        >
          login as Admin
        </Link>
      </div>
      <div className=" flex justify-center mt-6">
        <button
          onClick={() => {
            navigate("/");
          }}
          className="flex items-center text-gray-400 hover:text-main-blue transition-colors duration-200 text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chevron-left-icon lucide-chevron-left"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
};

export default TeacherLogin;
