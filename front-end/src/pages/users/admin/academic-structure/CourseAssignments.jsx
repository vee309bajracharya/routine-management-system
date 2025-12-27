import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const CourseAssignments = () => {
  const [courseName, setCourseName] = useState("Cyber Law");
  const [teacherName, setTeacherName] = useState("Ashish Shrestha");
  const [batchName, setBatchName] = useState("2023 BCA");
  const [semesterName, setSemesterName] = useState("Seventh");
  const [departmentName, setDepartmentName] = useState("BCA");
  const [assignmentType, setAssignmentType] = useState("Theory");
  const [note, setNote] = useState("");

  const courses = [
    { value: "", label: "Select Course Name" },
    { value: "cyber-law", label: "Cyber Law" },
  ];

  const teachers = [
    { value: "", label: "Select Teacher Name" },
    { value: "ashish-shrestha", label: "Ashish Shrestha" },
  ];

  const batches = [
    { value: "", label: "Select Batch Name" },
    { value: "2022-bca", label: "2022 BCA" },
  ];

  const semesters = [
    { value: "", label: "Select Semester Name" },
    { value: "seventh", label: "Seventh" },
  ];

  const departments = [
    { value: "", label: "Select Department Name" },
    { value: "bca", label: "BCA" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ courseName, teacherName, batchName, semesterName, departmentName, assignmentType, note });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Course Assignments
        </h2>
        <p className="form-subtext">
          Create course assignment for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Course Name and Teacher Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Course Name</label>
              <div className="relative">
                <select
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="inputbox form-option text-box-outline appearance-none pr-10 w-full"
                >
                  {courses.map((course) => (
                    <option key={course.value} value={course.value}>
                      {course.label}
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
              <label className="form-title">Teacher Name</label>
              <div className="relative">
                <select
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="inputbox form-option text-box-outline appearance-none pr-10 w-full"
                >
                  {teachers.map((teacher) => (
                    <option key={teacher.value} value={teacher.value}>
                      {teacher.label}
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

          {/* Batch Name and Semester Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Batch Name</label>
              <div className="relative">
                <select
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="inputbox form-option text-box-outline appearance-none pr-10 w-full"
                >
                  {batches.map((batch) => (
                    <option key={batch.value} value={batch.value}>
                      {batch.label}
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
                  className="inputbox form-option text-box-outline appearance-none pr-10 w-full"
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

          {/* Department Name and Assignment Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Department Name</label>
              <div className="relative">
                <select
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="inputbox form-option text-box-outline appearance-none pr-10 w-full"
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
              <label className="form-title">Assignment Type</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="assignmentType"
                    value="Theory"
                    checked={assignmentType === "Theory"}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    className="form-radio"
                  />
                  Theory
                </label>
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="assignmentType"
                    value="Practical"
                    checked={assignmentType === "Practical"}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    className="form-radio"
                  />
                  Practical
                </label>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="form-title">Note</label>
            <textarea
              placeholder="Write details about Course Assignment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="inputbox resize-none"
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

export default CourseAssignments;