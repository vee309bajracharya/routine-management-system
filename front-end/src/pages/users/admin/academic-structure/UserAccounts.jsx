import React, { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

const UserAccounts = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Admin");

  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("");

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
          <label className="form-title">Role</label>
          <div className="flex items-center gap-6">
            <label className="form-radio-title">
              <input
                type="radio"
                name="role"
                value="Admin"
                checked={role === "Admin"}
                onChange={() => setRole("Admin")}
                className="form-radio"
              />
              Admin
            </label>

            <label className="form-radio-title">
              <input
                type="radio"
                name="role"
                value="Teacher"
                checked={role === "Teacher"}
                onChange={() => setRole("Teacher")}
                className="form-radio"
              />
              Teacher
            </label>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Full Name */}
          <div>
            <label className="form-title">Full Name</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              className="dropdown-select"
            />
          </div>

          {/* Email */}
          <div>
            <label className="form-title">Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              className="dropdown-select"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="form-title">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              className="dropdown-select"
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
            <label className="form-title">Phone Number</label>
            <input
              type="text"
              placeholder="Enter Your Number"
              className="dropdown-select"
            />
          </div>

          {/* Teacher Only Fields */}
          {role === "Teacher" && (
            <>
              {/* Teacher's Department */}
              <div>
                <label className="form-title">Teacher's Department</label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="dropdown-select"
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    <option value="bca">BCA</option>
                    <option value="csit">CSIT</option>
                  </select>
                </div>
              </div>

              {/* Employment Type */}
              <div>
                <label className="form-title">Employment Type</label>
                <div className="flex items-center gap-6 mt-2">
                  <label className="form-radio-title">
                    <input
                      type="radio"
                      name="employmentType"
                      value="Full Time"
                      checked={employmentType === "Full Time"}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="form-radio"
                    />
                    Full Time
                  </label>

                  <label className="form-radio-title">
                    <input
                      type="radio"
                      name="employmentType"
                      value="Part Time"
                      checked={employmentType === "Part Time"}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="form-radio"
                    />
                    Part Time
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button className="cancel-btn">Cancel</button>
          <button className="auth-btn">Create</button>
        </div>
      </div>
    </div>
  );
};

export default UserAccounts;
