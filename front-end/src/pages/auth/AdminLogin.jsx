import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Remember:", remember);
  };
  let navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white shadow-md rounded-2xl px-6 py-8 w-full max-w-sm">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-primary-text">
          Admin Login
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
          to="/TeacherLogin"
          className="block text-center mt-5 text-main-blue hover:underline cursor-pointer"
        >
          login as Teacher
        </Link>
        
      </div>
      <div className=" flex justify-center mt-6">
          <button
            onClick={() =>{
              navigate('/')
            }}
            className="flex items-center text-gray-400 hover:text-main-blue transition-colors duration-200 text-sm font-medium"
          >
            <span className="mr-1 text-lg">←</span> Back
          </button>
        </div>
      
    </div>
  );
};

export default AdminLogin;
