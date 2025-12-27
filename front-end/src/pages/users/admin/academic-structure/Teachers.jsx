import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const Teachers = () => {
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("Part Time");

  const teacherNames = [
    { value: "", label: "Enter Teacher's Full Name" },
    { value: "ashish", label: "Ashish" },
    { value: "veerin", label: "Veerin" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ fullName, department, employmentType });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Teachers
        </h2>
        <p className="form-subtext">
          Create login identities for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Teacher's Full Name */}
          <div>
            <label className="form-title">Teacher's Full Name</label>
            <div className="relative">
              <select
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`inputbox form-option text-box-outline appearance-none pr-10 w-full ${
                  fullName === "" ? "text-box-outline" : "text-black"
                }`}
              >
                {teacherNames.map((teacher) => (
                  <option
                    key={teacher.value}
                    value={teacher.value}
                    disabled={teacher.value === ""}
                  >
                    {teacher.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-box-outline pointer-events-none"
              />
            </div>
          </div>

          {/* Teacher's Department */}
          <div>
            <label className="form-title">Teacher's Department</label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`inputbox form-option text-box-outline appearance-none pr-10 w-full ${
                  fullName === "" ? "text-box-outline" : "text-black"
                }`}
              >
                <option value="" disabled>
                  Select Department
                </option>
                <option value="bca">BCA</option>
                <option value="csit">CSIT</option>
              </select>

              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-box-outline pointer-events-none"
              />
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

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button type="button" className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="auth-btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Teachers;
