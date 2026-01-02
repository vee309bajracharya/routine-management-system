import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const AcademicYears = () => {
  const [department, setDepartment] = useState("");
  const [academicYearName, setAcademicYearName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const departments = [
    { value: "", label: "Select Department" },
    { value: "bca", label: "BCA" },
    { value: "csit", label: "CSIT" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ department, academicYearName, startDate, endDate });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Academic Year
        </h2>
        <p className="form-subtext">
          Create login identities for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Department */}
          <div>
            <label className="form-title">Department</label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`dropdown-select`}
              >
                {departments.map((dept) => (
                  <option
                    key={dept.value}
                    value={dept.value}
                    disabled={dept.value === ""}
                    className="bg-white dark:bg-dark-overlay text-black dark:text-white"
                  >
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Year Name */}
          <div>
            <label className="form-title">Academic Year Name</label>
            <input
              type="text"
              placeholder="Enter Academic Year Name"
              value={academicYearName}
              onChange={(e) => setAcademicYearName(e.target.value)}
              className="dropdown-select"
            />
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="dropdown-select"
              />
            </div>

            <div>
              <label className="form-title">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="dropdown-select"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button type="button" className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="auth-btn">
                Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicYears;
