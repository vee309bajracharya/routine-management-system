import React, { useState } from "react";
import { SquarePen, X } from "lucide-react";

const AdminDepartment = () => {
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedSemesters, setSelectedSemesters] = useState({});
  const [departmentSelectValue, setDepartmentSelectValue] = useState("");

  const departments = [
    { id: "bca", name: "Bachelors in Computer Application (BCA)" },
    { id: "bit", name: "Bachelors in Information Technology (BIT)" },
    { id: "csit", name: "BSc CSIT" },
    { id: "bba", name: "Bachelor of Business Administration (BBA)" },
  ];

  // Academic data per department
  const departmentDataMap = {
    bca: [
      {
        academicYear: "BCA-2022",
        semester: "8th Semester",
        batch: "2022 Batch - Morning Shift",
      },
      {
        academicYear: "BCA-2022",
        semester: "7th Semester",
        batch: "2022 Batch - Morning Shift",
      },
    ],
    bit: [
      {
        academicYear: "BIT-2022",
        semester: "8th Semester",
        batch: "2022 Batch - Morning Shift",
      },
      {
        academicYear: "BIT-2022",
        semester: "7th Semester",
        batch: "2022 Batch - Morning Shift",
      },
    ],
    csit: [],
    bba: [],
  };

  const coursesData = [
    {
      teacher: "Suresh Shrestha",
      course: "Cyber Security",
      time: "6:30 AM - 7:30 AM",
    },
    {
      teacher: "Full Maya",
      course: "E-Governance",
      time: "7:30 AM - 8:30 AM",
    },
    {
      teacher: "Rakesh Thapa",
      course: "Cloud Computing",
      time: "6:30 AM - 7:30 AM",
    },
    {
      teacher: "Sita Shrestha",
      course: "Software Project Management",
      time: "7:30 AM - 8:30 AM",
    },
  ];

  const semesters = [{ value: "2nd Semester", label: "2nd Semester" }];

  // Dynamic label from API data
  const getDepartmentLabel = (deptId) =>
    departments.find((d) => d.id === deptId)?.name;

  // Dynamic department academic data
  const getDepartmentData = (deptId) => departmentDataMap[deptId] || [];

  const addDepartment = (deptId) => {
    if (!deptId) return;

    if (!selectedDepartments.includes(deptId)) {
      setSelectedDepartments((prev) => [...prev, deptId]);
      setSelectedSemesters((prev) => ({ ...prev, [deptId]: "" }));
    }

    setDepartmentSelectValue("");
  };

  const removeDepartment = (deptId) => {
    setSelectedDepartments((prev) => prev.filter((d) => d !== deptId));
    setSelectedSemesters((prev) => {
      const copy = { ...prev };
      delete copy[deptId];
      return copy;
    });
  };

  const handleSemesterChange = (deptId, value) => {
    setSelectedSemesters((prev) => ({ ...prev, [deptId]: value }));
  };

  return (
    <div className="p-6 space-y-6 font-general-sans">
      {/* HEADER */}
      <div>
        <h1 className="form-header">Department</h1>
        <p className="form-subtext">
          Select a department to view and manage department records.
        </p>
      </div>
      {/* DEPARTMENT SELECT */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <select
            value={departmentSelectValue}
            onChange={(e) => addDepartment(e.target.value)}
            className="inputbox"
          >
            <option value="" disabled>
              Choose a department
            </option>
            {departments.map((dept) => (
              <option
                key={dept.id}
                value={dept.id}
                disabled={selectedDepartments.includes(dept.id)}
              >
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {selectedDepartments.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedDepartments.map((deptId) => (
              <div
                key={deptId}
                className="flex items-center gap-2 bg-main-blue text-white px-3 py-1 rounded-sm"
              >
                {getDepartmentLabel(deptId)}
                <button
                  onClick={() => removeDepartment(deptId)}
                  className="hover:text-error-red"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* EMPTY STATE */}
      {selectedDepartments.length === 0 && (
        <div className="grid grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="border border-box-outline rounded-lg p-6 bg-white dark:bg-dark-overlay">
            <div className="flex justify-between mb-6">
              <h2 className="form-title">Department Name</h2>
              <button
                disabled
                className="flex items-center gap-1 border border-box-outline dark:text-white px-2 rounded-sm opacity-50 cursor-not-allowed"
              >
                Edit <SquarePen size={16} />
              </button>
            </div>

            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">Academic Year</th>
                  <th className="table-header">Semester</th>
                  <th className="table-header">Batch</th>
                </tr>
              </thead>
            </table>

            <div className="h-40 flex items-center justify-center text-sub-text">
              No department selected
            </div>
          </div>

          {/* RIGHT */}
          <div className="border border-box-outline rounded-lg p-6 bg-white dark:bg-dark-overlay">
            <h2 className="form-title mb-4">Courses and Time Slots</h2>
            <p className="form-subtext mb-2">
              Choose a semester to view available courses and time slots.
            </p>

            <select disabled className="inputbox w-full">
              <option>Choose a Semester</option>
            </select>

            <div className="h-40 flex items-center justify-center text-sub-text">
              No semester selected
            </div>
          </div>
        </div>
      )}
      {/* SELECTED STATE */}
      {selectedDepartments.map((deptId) => (
        <div key={deptId} className="grid grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="border border-box-outline rounded-lg p-6 bg-white dark:bg-dark-overlay">
            <div className="flex justify-between mb-4">
              <h2 className="form-title">{getDepartmentLabel(deptId)}</h2>
              <button className="flex items-center gap-1 border border-box-outline hover:bg-primary6-blue dark:hover:bg-dark-hover dark:text-white px-2 rounded-sm">
                Edit <SquarePen size={16} />
              </button>
            </div>

            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">Academic Year</th>
                  <th className="table-header">Semester</th>
                  <th className="table-header">Batch</th>
                </tr>
              </thead>
              <tbody>
                {getDepartmentData(deptId).map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-primary-text dark:text-white">
                      {row.academicYear}
                    </td>
                    <td className="px-4 py-2 text-primary-text dark:text-white">
                      {row.semester}
                    </td>
                    <td className="px-4 py-2 text-primary-text dark:text-white">
                      {row.batch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT */}
          <div className="border border-box-outline rounded-lg p-6 bg-white dark:bg-dark-overlay">
            <h2 className="form-title mb-4">Courses and Time Slots</h2>
            <p className="form-subtext mb-2">
              Choose a semester to view available courses and time slots.
            </p>

            <select
              value={selectedSemesters[deptId] || ""}
              onChange={(e) => handleSemesterChange(deptId, e.target.value)}
              className="inputbox w-full"
            >
              <option value="" disabled>
                Choose a Semester
              </option>

              {semesters.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {selectedSemesters[deptId] && (
              <table className="min-w-full mt-4">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-primary-text dark:text-white">
                      Teacher & Course
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-primary-text dark:text-white">
                      Teacher&apos;s Time Availability
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coursesData.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-primary-text dark:text-white">
                        {row.teacher}
                        <br />
                        <span className="text-sub-text">{row.course}</span>
                      </td>
                      <td className="px-4 py-2 text-primary-text dark:text-white">
                        {row.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDepartment;
