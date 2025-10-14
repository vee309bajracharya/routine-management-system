import React, { useState } from "react";

const Login = () => {
  const [userType, setUserType] = useState("teacher"); // "teacher" or "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${userType.toUpperCase()} Login:`, { email, password });
    // Add login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-general-sans">
      <div className="bg-white shadow-md rounded-xl px-5 py-7.5 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-1">Schedule Portal</h1>
        <p className="text-center text-primary mb-6">
          Login as {userType === "teacher" ? "Teacher" : "Admin"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-primary-main mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inputbox"
              required
            />
          </div>
          

          <div>
            <label className="block text-primary-main mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inputbox"
              required
            />
          </div>

          <button
            type="submit"
            // className="w-full bg-main-blue text-white py-2 rounded-lg hover:bg-hover-blue transition"

          >
            Submit
          </button>
        </form>

        {/* 👇 Toggle Text */}
        <p
          onClick={() =>
            setUserType(userType === "teacher" ? "admin" : "teacher")
          }
          className="text-center mt-5 text-blue-link hover:underline cursor-pointer"
        >
          {userType === "teacher"
            ? "Login as Admin"
            : "Login as Teacher"}
        </p>
      </div>
    </div>
  );
};

export default Login;
