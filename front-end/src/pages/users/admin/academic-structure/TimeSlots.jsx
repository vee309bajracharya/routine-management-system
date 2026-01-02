import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";

const TimeSlots = () => {
  const [slotType, setSlotType] = useState("Lecture");
  const [shift, setShift] = useState("Morning");
  const [department, setDepartment] = useState("BCA");
  const [semester, setSemester] = useState("First Semester (7)");
  const [batch,setBatch]= useState("BCA2022");
  const [name, setName] = useState("Cyber Law(first period)");
  const [startTime, setStartTime] = useState("06:35");
  const [endTime, setEndTime] = useState("07:35");
  const [duration, setDuration] = useState("60");
  const [selectedDays, setSelectedDays] = useState(""); // selected days
  const [applicableDaysOpen, setApplicableDaysOpen] = useState(false);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const departments = [
    { value: "", label: "Select Department" },
    { value: "bca", label: "BCA" },
    { value: "csit", label: "CSIT" },
  ];
  const batches = [
    { value: "", label: "Select Batch" },
    { value: "bca2022", label: "BCA 2022" },
    { value: "csit2022", label: "CSIT 2022" },
  ];
  const nameslist = [
    { value: "", label: "Select Name" },
    { value: "first Period/cyber law(first period)", label: "Cyber Law(first period)" },
    { value: "second Period/software project management(second period)", label: "SPM(second period)" },
    { value: "first Period/cloud computing(first period)", label: "Cloud Computing(first period)" },
    { value: "second Period/e-governance(second period)", label: "E-Governance(second period)" },
  ];

  const semestersList = [
    { value: "", label: "Select Semester" },
    { value: "first-semester-7", label: "Seventh Semester" },
  ];


  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const selectAllDays = () => {
    setSelectedDays(days);
  };

  const removeSelectedDay = (day) => {
    setSelectedDays((prev) => prev.filter((d) => d !== day));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      slotType,
      shift,
      department,
      semester,
      batch,
      startTime,
      endTime,
      duration,
      selectedDays,
    });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Time Slots
        </h2>
        <p className="form-subtext">
          Create time slots for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Slot Type and Shift */}
          <div className="grid grid-cols-2 gap-4">
            {/* Slot Type */}
            <div>
              <label className="form-title">Slot Type</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="slotType"
                    value="Lecture"
                    checked={slotType === "Lecture"}
                    onChange={(e) => setSlotType(e.target.value)}
                    className="form-radio"
                  />
                  Lecture
                </label>
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="slotType"
                    value="Practical"
                    checked={slotType === "Practical"}
                    onChange={(e) => setSlotType(e.target.value)}
                    className="form-radio"
                  />
                  Practical
                </label>
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="slotType"
                    value="Break"
                    checked={slotType === "Break"}
                    onChange={(e) => setSlotType(e.target.value)}
                    className="form-radio"
                  />
                  Break
                </label>
              </div>
            </div>
            {/* Shift */}
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

          {/* Department Name and Semester Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Department Name</label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
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
              <label className="form-title">Semester Name</label>
              <div className="relative">
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="dropdown-select"
                >
                  {semestersList.map((sem) => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Batch and Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Batch</label>
              <div className="relative">
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="dropdown-select"
                >
                  {batches.map((batch) => (
                    <option key={batch.value} value={batch.value}>
                      {batch.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="form-title">Name</label>
              <div className="relative">
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dropdown-select"
                >
                  {nameslist.map((name) => (
                    <option key={name.value} value={name.value}>
                      {name.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          

          {/* Start Time and End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="dropdown-select"
              />
            </div>
            <div>
              <label className="form-title">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="dropdown-select"
              />
            </div>
          </div>

          {/* Duration in minutes */}
          <div>
            <label className="form-title">Duration in minutes</label>
            <input
              type="number"
              placeholder="Enter Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="dropdown-select"
            />
          </div>

          {/* Applicable Days */}
          <div>
            <label className="form-title">Applicable Days</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setApplicableDaysOpen(!applicableDaysOpen)}
                className="dropdown-select w-full flex items-center"
              >
                {selectedDays.length > 0 ? (
                  selectedDays.map((day) => (
                    <span
                      key={day}
                      className="inline-flex items-center bg-main-blue text-white text-xs px-2 py-1 rounded-full"
                    >
                      {day}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedDay(day);
                        }}
                        className="ml-1 hover:bg-blue-600 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-sub-text">Select Applicable Days</span>
                )}
                <ChevronDown
                  size={18}
                  className={`ml-auto text-black dark:text-white transition-transform ${applicableDaysOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {applicableDaysOpen && (
                <div className="dropdown-select">
                  {/* Weeks Section */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-primary-text dark:text-white">Weeks</span>
                      <button
                        type="button"
                        onClick={selectAllDays}
                        className="px-3 py-1 bg-box-outline rounded text-xs text-primary-text hover:bg-gray-300"
                      >
                        All
                      </button>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {days.map((day) => (
                        <label key={day} className="flex items-center gap-1 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            onChange={() => toggleDay(day)}
                            className="form-radio h-3 w-3"
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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

export default TimeSlots;