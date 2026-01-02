import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const Courses = () => {
  const [departmentName, setDepartmentName] = useState("BCA");
  const [semesterNumber, setSemesterNumber] = useState("7");
  const [courseName, setCourseName] = useState("Cyber Law");
  const [courseCode, setCourseCode] = useState("CACS 401");
  const [courseType, setCourseType] = useState("Theory");
  const [description, setDescription] = useState("");

  const departments = [
    { value: "", label: "Select Department Name" },
    { value: "bca", label: "BCA" },
    { value: "csit", label: "CSIT" },
  ];

  const semesters = [
    { value: "", label: "Select Semester Number" },
    { value: "1", label: "1" },
    { value: "7", label: "7" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      departmentName,
      semesterNumber,
      courseName,
      courseCode,
      courseType,
      description,
    });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Courses
        </h2>
        <p className="form-subtext">
          Create login identities for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Department Name and Semester Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Department Name</label>
              <div className="relative">
                <select
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="dropdown-select"
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="form-title">Semester Number</label>
              <div className="relative">
                <select
                  value={semesterNumber}
                  onChange={(e) => setSemesterNumber(e.target.value)}
                  className="dropdown-select"
                >
                  {semesters.map((sem) => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Course Name and Course Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Course Name</label>
              <input
                type="text"
                placeholder="Enter Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="dropdown-select"
              />
            </div>
            <div>
              <label className="form-title">Course Code</label>
              <input
                type="text"
                placeholder="Enter Course Code"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="dropdown-select"
              />
            </div>
          </div>

          {/* Course Type */}
          <div>
            <label className="form-title">Course Type</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="form-radio-title">
                <input
                  type="radio"
                  name="courseType"
                  value="Theory"
                  checked={courseType === "Theory"}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="form-radio"
                />
                Theory
              </label>
              <label className="form-radio-title">
                <input
                  type="radio"
                  name="courseType"
                  value="Practical"
                  checked={courseType === "Practical"}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="form-radio"
                />
                Practical
              </label>
              <label className="form-radio-title">
                <input
                  type="radio"
                  name="courseType"
                  value="Both"
                  checked={courseType === "Both"}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="form-radio"
                />
                Both
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-title">Description</label>
            <textarea
              placeholder="Write description about course"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="textarea-input resize-none"
            />
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

export default Courses;
