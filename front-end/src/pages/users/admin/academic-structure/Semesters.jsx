import React, { useState } from "react";
import { ChevronDown, Calendar } from "lucide-react";

const Semesters = () => {
  const [academicYear, setAcademicYear] = useState("BCA-2022");
  const [semesterName, setSemesterName] = useState("Seventh Semester");
  const [semesterNumber, setSemesterNumber] = useState("7");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const academicYears = [
    { value: "", label: "Select Academic Year" },
    { value: "bca-2022", label: "BCA-2022" },
    { value: "csit-2023", label: "CSIT-2023" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ academicYear, semesterName, semesterNumber, startDate, endDate });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Semesters
        </h2>
        <p className="form-subtext">
          Create login identities for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Academic Year, Semester Name, and Semester Number */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-title">Academic Year</label>
              <div className="relative">
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={`inputbox form-option text-box-outline appearance-none pr-10 w-full ${
                    academicYear === "" ? "text-box-outline" : "text-black"
                  }`}
                >
                  {academicYears.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
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
              <input
                type="text"
                placeholder="Enter Semester Name"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                className="inputbox"
              />
            </div>
            <div>
              <label className="form-title">Semester Number</label>
              <input
                type="number"
                placeholder="Enter Semester Number"
                value={semesterNumber}
                onChange={(e) => setSemesterNumber(e.target.value)}
                className="inputbox"
              />
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="form-title">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="inputbox pr-10"
              />
            </div>
            <div className="relative">
              <label className="form-title">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="inputbox pr-10"
              />
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

export default Semesters;