import React from "react";
import { RotateCw,Download } from "lucide-react";

const Overview = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = Array(4).fill(""); // 4 periods

  return (
    <section className="font-general-sans mt-4">
      {/* Top Controls */}
      <div className="flex justify-between mb-4">
        <h1 className="text-md font-medium">Select multiple block to get started</h1>
        <div className="flex justify-center gap-3 text-sm font-medium">
          <span>Department:</span>
          <span>Batch:</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-4 text-xs">
        <div className="flex justify-center gap-3">
          <button className="overview-btn px-3 py-1">Create</button>
          <button className="overview-btn px-3 py-1">Edit</button>
          <button className="overview-btn px-3 py-1">Clear</button>
          <button className="overview-btn px-3 py-1">Add Time slot</button>
          <button className="overview-btn px-3 py-1">Add Date Duration</button>
        </div>
        <div className="flex justify-center items-center gap-4">
          <button className="flex items-center gap-1 bg-warning-faidorange px-3 py-1 rounded">
            <RotateCw size={16} />
            Check for Overlaps
          </button>
          <button className="overview-btn px-3 py-1">Save</button>
          <button className="overview-btn px-3 py-1">Load</button>
          <button className="flex justify-between gap-1 border border-main-blue px-3 py-1 text-main-blue rounded"><Download size={16}/>Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-md overflow-hidden bg-white mt-4">
        {/* Header Row */}
        <div className="grid grid-cols-10 border-b border-gray-300">
          <div className="border-r border-gray-300 p-2 font-semibold text-sm text-center bg-gray-50 flex items-center justify-center">
            Day/Period
          </div>

          {Array(8)
            .fill("")
            .map((_, idx) => (
              <div
                key={idx}
                className="border-r border-gray-300 p-2 text-xs text-center bg-white flex flex-col justify-center h-[70px]"
              >
                <div className="font-semibold">{idx % 2 === 0 ? "I" : "II"}</div>
                <div className="text-[10px]">10:15–11:55</div>
              </div>
            ))}
        </div>

        {/* Days Rows */}
        {days.map((day, idx) => (
          <div
            key={idx}
            className="grid grid-cols-10 border-b border-gray-300 last:border-b-0"
          >
            {/* Day Name */}
            <div className="border-r border-gray-300 p-2 text-sm font-medium bg-gray-50 flex items-center justify-center">
              {day}
            </div>

            {/* Checkboxes */}
            {periods.map((_, cIdx) => (
              <div
                key={cIdx}
                className="border-r col-span-2 border-gray-300 flex items-center p-4 h-auto pl-2"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600 cursor-pointer" />
                </div>
                <div className="flex flex-col justify-center items-start ml-2 h-full text-[10px]">
                  <span className="font-semibold">Design of RCC Structure 1</span>
                  <span>Lecture Room [B-407]</span>
                  <span>PP, SKT, KLM</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Overview;
