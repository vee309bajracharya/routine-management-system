/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RoutineAlert from "./RoutineAlert";

const RoutineEntry = ({ isOpen, onClose }) => {
  const [department, setDepartment] = useState("");
  const [tempDepartment, setTempDepartment] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [batch, setBatch] = useState("");
  const [shift, setShift] = useState("");
  const [course, setCourse] = useState("");
  const [room, setRoom] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [day, setDay] = useState("");
  const [entryType, setEntryType] = useState("");

  // Department change handler
  const handleDepartmentChange = (e) => {
    const newDept = e.target.value;

    // If no previous department selected → directly set
    if (!department) {
      setDepartment(newDept);
      return;
    }

    // If same department selected → do nothing
    if (newDept === department) return;

    // Check if any other field has been filled
    const hasOtherValues =
      academicYear ||
      semester ||
      batch ||
      shift ||
      course ||
      room ||
      timeSlot ||
      day ||
      entryType;

    // If NO other field selected change without alert
    if (!hasOtherValues) {
      setDepartment(newDept);
      return;
    }

    // Otherwise, show alert
    setTempDepartment(newDept);
    setShowAlert(true);
  };

  // CONFIRM CHANGE (RESET FIELDS)
  const handleConfirmChange = () => {
    setDepartment(tempDepartment);

    // Reset everything else
    setAcademicYear("");
    setSemester("");
    setBatch("");
    setShift("");
    setCourse("");
    setRoom("");
    setTimeSlot("");
    setDay("");
    setEntryType("");

    setShowAlert(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="schedulebtn-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="bg-white rounded-xl w-[700px] p-6 shadow-xl relative font-general-sans"
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="schedulepopup-title">Create Routine Entry</h2>
              <button onClick={onClose} className="scheduleClose-btn">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* FORM INPUTS */}
              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="createSchedule-label">Department</label>
                  <select
                    className="createSchedule-option"
                    value={department}
                    onChange={handleDepartmentChange}
                  >
                    <option value="">Select</option>
                    <option>BCA</option>
                    <option>BBA</option>
                  </select>

                  {/* ALERT POPUP */}
                  <RoutineAlert
                    isOpen={showAlert}
                    onClose={() => setShowAlert(false)}
                    onContinue={handleConfirmChange}
                  />
                </div>

                {/* Academic Year */}
                <div>
                  <label className="createSchedule-label">Academic Year</label>
                  <select
                    className="createSchedule-option"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>BCA-2022</option>
                    <option>BCA-2023</option>
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="createSchedule-label">Semester</label>
                  <select
                    className="createSchedule-option"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>1st Semester</option>
                    <option>7th Semester</option>
                  </select>
                </div>

                {/* Batch */}
                <div>
                  <label className="createSchedule-label">Batch</label>
                  <select
                    className="createSchedule-option"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>BCA 2022 (Morning)</option>
                  </select>
                </div>

                {/* Shift */}
                <div>
                  <label className="createSchedule-label">Shift</label>
                  <select
                    className="createSchedule-option"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Morning</option>
                    <option>Day</option>
                  </select>
                </div>

                {/* Course */}
                <div>
                  <label className="createSchedule-label">Course Assignment</label>
                  <select
                    className="createSchedule-option"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Cloud Computing - Prashant</option>
                    <option>Cyber Law - Harish</option>
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label className="createSchedule-label">Room</label>
                  <select
                    className="createSchedule-option"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Room 301</option>
                    <option>Room 202</option>
                  </select>
                </div>

                {/* Time Slot */}
                <div>
                  <label className="createSchedule-label">Time Slot</label>
                  <select
                    className="createSchedule-option"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>06:00 - 07:00</option>
                    <option>07:00 - 08:00</option>
                  </select>
                </div>

                {/* Day */}
                <div>
                  <label className="createSchedule-label">Day</label>
                  <select
                    className="createSchedule-option"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Sunday</option>
                    <option>Monday</option>
                    <option>Tuesday</option>
                  </select>
                </div>

                {/* Entry Type */}
                <div>
                  <label className="createSchedule-label">Entry Type</label>
                  <select
                    className="createSchedule-option"
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Lecture</option>
                    <option>Practical</option>
                  </select>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end pt-4">
                <button type="submit" className="auth-btn">
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoutineEntry;
