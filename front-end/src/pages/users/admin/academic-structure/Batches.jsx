import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const Batches = () => {
  const [departmentName, setDepartmentName] = useState("BCA");
  const [semesterName, setSemesterName] = useState("First Semester");
  const [batchCode, setBatchCode] = useState("BCA-2022");
  const [batchName, setBatchName] = useState("2022 BCA Batch");
  const [batchYearLevel, setBatchYearLevel] = useState("4 Year");
  const [shift, setShift] = useState("Morning");

  const departments = [
    { value: "", label: "Select Department Name" },
    { value: "bca", label: "BCA" },
    { value: "csit", label: "CSIT" },
  ];

  const semesters = [
    { value: "", label: "Select Semester Name" },
    { value: "first-semester", label: "First Semester" },
    { value: "second-semester", label: "Second Semester" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ departmentName, semesterName, batchCode, batchName, batchYearLevel, shift });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Batches
        </h2>
        <p className="form-subtext">
          Create login identities for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Department Name and Semester Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Department Name</label>
              <div className="relative">
                <select
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className={`inputbox form-option text-box-outline appearance-none pr-10 w-full ${
                    departmentName === "" ? "text-sub-text" : "text-black"
                  }`}
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label className="form-title">Semester Name</label>
              <div className="relative">
                <select
                  value={semesterName}
                  onChange={(e) => setSemesterName(e.target.value)}
                  className={`inputbox form-option text-box-outline appearance-none pr-10 w-full ${
                    semesterName === "" ? "text-sub-text" : "text-black"
                  }`}
                >
                  {semesters.map((sem) => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Batch Code and Batch Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Batch Name</label>
              <input
                type="text"
                placeholder="Enter Batch Name"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="inputbox"
              />
            </div>
            <div>
              <label className="form-title">Batch Code</label>
              <input
                type="text"
                placeholder="Enter Batch Code"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="inputbox"
              />
            </div>
            
          </div>

          {/* Batch Year and Shift */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Batch Year Level</label>
              <input
                type="text"
                placeholder="Enter Batch Year Level"
                value={batchYearLevel}
                onChange={(e) => setBatchYearLevel(e.target.value)}
                className="inputbox"
              />
            </div>
            <div>
              <label className="form-title">Shift</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="shift"
                    value="Morning"
                    checked={shift === "Morning"}
                    onChange={(e) => setShift(e.target.value)}
                    className="form-radio"
                  />
                  Morning
                </label>
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="shift"
                    value="Day"
                    checked={shift === "Day"}
                    onChange={(e) => setShift(e.target.value)}
                    className="form-radio"
                  />
                  Day
                </label>
              </div>
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

export default Batches;