import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const AcademicDepartments = () => {
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [headOfDepartment, setHeadOfDepartment] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      departmentName,
      departmentCode,
      headOfDepartment,
      description,
    });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">
          Departments
        </h2>
        <p className="form-subtext">
          Create departments for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Department Name and Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Department Name</label>
              <input
                type="text"
                placeholder="Enter Department Name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="inputbox"
              />
            </div>
            <div>
              <label className="form-title">Department Code</label>
              <input
                type="text"
                placeholder="Enter Department Code"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                className="inputbox"
              />
            </div>
          </div>

          {/* Head of Department */}
          <div>
            <label className="form-title">Head of Department</label>
            <div className="relative">
              <select
                value={headOfDepartment}
                onChange={(e) => setHeadOfDepartment(e.target.value)}
                className={`inputbox dark:bg-dark-overlay appearance-none pr-10 w-full ${
                  headOfDepartment === ""
                    ? "!text-box-outline"
                    : "text-black"
                }`}
              >
                <option value="" disabled>
                  Select Head of Department
                </option>
                <option value="john-doe">Ashish</option>
                <option value="jane-smith">Veerin</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text pointer-events-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-title">Description</label>
            <textarea
              placeholder="Write a description about department"
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

export default AcademicDepartments;