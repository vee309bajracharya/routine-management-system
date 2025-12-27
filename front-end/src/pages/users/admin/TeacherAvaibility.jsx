import React, { useState } from "react";
import { ChevronDown, Clock, Info } from "lucide-react";

const TeacherAvailability = () => {
  const [teacherName, setTeacherName] = useState("");
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [timeSlots, setTimeSlots] = useState({
    sunday: { from: "", to: "", period: "AM" },
    monday: { from: "", to: "", period: "AM" },
    tuesday: { from: "", to: "", period: "AM" },
    wednesday: { from: "", to: "", period: "AM" },
    thursday: { from: "", to: "", period: "AM" },
    friday: { from: "", to: "", period: "AM" },
  });
  const [description, setDescription] = useState("");

  const days = [
    { short: "Sun", full: "Sunday" },
    { short: "Mon", full: "Monday" },
    { short: "Tue", full: "Tuesday" },
    { short: "Wed", full: "Wednesday" },
    { short: "Thu", full: "Thursday" },
    { short: "Fri", full: "Friday" },
  ];

  const toggleDay = (day) => {
    setSelectedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  const selectAllDays = () => {
    setSelectedDays(new Set(days.map((d) => d.short)));
  };

  const handleTimeChange = (day, field, value) => {
    setTimeSlots((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      teacherName,
      selectedDays: Array.from(selectedDays),
      timeSlots,
      description,
    });
  };

  const teachers = [
    { value: "", label: "Enter Full Name" },
    { value: "Veerin", label: "Veerin" },
    { value: "Bishant", label: "Bishant" },
  ];

  const selectedDayList = Array.from(selectedDays);

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Teacher Availability
        </h2>
        <p className="form-subtext">
          Create login identities for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Teacher Name */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-box-outline pointer-events-none"
              />
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <label className="form-title">Days of Week</label>
            <div className="flex items-center gap-2 mb-4">
              {days.map((day) => (
                <label
                  key={day.short}
                  className="flex items-center gap-2 cursor-pointer dark:text-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.has(day.short)}
                    onChange={() => toggleDay(day.short)}
                    className="form-radio"
                  />
                  {day.short}
                </label>
              ))}
              <button
                type="button"
                onClick={selectAllDays}
                className="ml-auto px-4 py-2 bg-main-blue text-white rounded-lg text-sm hover:bg-hover-blue"
              >
                All
              </button>
            </div>

            {/* Selected Days Time Slots */}
            {selectedDayList.length === 0 ? (
              <div className="text-center text-sub-text py-4">
                No Days Selected
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayList.map((dayShort) => {
                  const dayFull = days
                    .find((d) => d.short === dayShort)
                    .full.toLowerCase()
                    .replace(" ", "");
                  return (
                    <div
                      key={dayShort}
                      className="flex items-center gap-3 p-3 border border-box-outline rounded-lg dark:text-white"
                    >
                      <Clock size={16} className="text-sub-text" />
                      <span className="font-medium text-sm min-w-[80px]">
                        {dayFull.charAt(0).toUpperCase() + dayFull.slice(1)}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={timeSlots[dayFull]?.from || ""}
                          onChange={(e) =>
                            handleTimeChange(dayFull, "from", e.target.value)
                          }
                          className="inputbox w-20"
                        />
                        -
                        <input
                          type="time"
                          value={timeSlots[dayFull]?.to || ""}
                          onChange={(e) =>
                            handleTimeChange(dayFull, "to", e.target.value)
                          }
                          className="inputbox w-20"
                        />
                      </div>
                      <select
                        value={timeSlots[dayFull]?.period || "AM"}
                        onChange={(e) =>
                          handleTimeChange(dayFull, "period", e.target.value)
                        }
                        className="inputbox w-16"
                      >
                        <option>AM</option>
                        <option>PM</option>
                      </select>
                      <Info
                        size={16}
                        className="text-sub-text cursor-pointer ml-auto"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="form-title">Notes</label>
            <textarea
              placeholder="Add additional notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

export default TeacherAvailability;
