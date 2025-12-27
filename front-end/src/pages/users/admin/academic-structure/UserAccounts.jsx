import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const UserAccounts = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">User Accounts</h2>
        <p className="form-subtext">
          Create login identities for admins and teachers to access the system.
        </p>

        {/* Role */}
        <div className="mt-6">
          <label className="form-title">
            Role
          </label>
          <div className="flex items-center gap-6">
            <label className="form-radio-title">
              <input
                type="radio"
                name="role"
                className="form-radio"
                defaultChecked
              />
              Admin
            </label>

            <label className="form-radio-title">
              <input type="radio" name="role" className="form-radio" />
              Teacher
            </label>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Full Name */}
          <div>
            <label className="form-title">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter Full Name"
              className="inputbox"
            />
          </div>

          {/* Email */}
          <div>
            <label className="form-title">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter Your Email"
              className="inputbox"
            />
          </div>
          {/* Password */}
          <div className="relative">
            <label className="form-title">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              className="inputbox"
              autoComplete="off"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-sub-text dark:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Phone Number */}
          <div>
            <label className="form-title">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Enter Your Number"
              className="inputbox"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button className="cancel-btn">
            Cancel
          </button>
          <button className="auth-btn">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAccounts;
