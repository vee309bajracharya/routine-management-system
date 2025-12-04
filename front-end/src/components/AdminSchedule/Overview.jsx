import React, { useState } from "react";
import {
  ChevronDown,
  Download,
  ChevronUp,
  Search,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";

const Overview = () => {
  // FIXED: Separate states for each dropdown
  const [isLast7Open, setIsLast7Open] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const toggleLast7 = () => setIsLast7Open(!isLast7Open);
  const toggleDateRange = () => setIsDateRangeOpen(!isDateRangeOpen);

  return (
    <section className="mt-4">
      {/* TOP filter and search */}
      <div className="w-full flex justify-between items-center flex-wrap gap-3">
        {/* Left Filters */}
        <div className="flex items-center flex-wrap gap-3">

          {/* Last 7 Days */}
          <button onClick={toggleLast7} className="overview-btn">
            Last 7 days
            {isLast7Open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Date Range */}
          <button onClick={toggleDateRange} className="overview-btn">
            <Calendar size={16} />
            15 Mar - 22 Mar
            {isDateRangeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button className="overview-status-btn">
              All <span className="text-sub-text">3</span>
            </button>

            <button className="overview-status-btn">
              Draft <span className="text-sub-text">13</span>
            </button>

            <button className="overview-status-btn">
              Approved <span className="text-sub-text">1</span>
            </button>

            <button className="overview-status-btn">
              Pending <span className="text-sub-text">10</span>
            </button>
          </div>
        </div>

        {/* Right Search and Export */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="flex items-center gap-2 border border-box-outline rounded-md px-3 py-1 bg-white dark:bg-dark-overlay">
            <Search size={16} className="text-sub-text" />
            <input
              type="text"
              placeholder="Search Routine"
              className="outline-none text-sm text-primary-text dark:text-white"
            />
          </div>

          {/* Export */}
          <button className="export-btn cursor-pointer">
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto-auto bg-white dark:bg-dark-overlay mt-4 text-primary-text dark:text-white">
        <table className="w-full text-sm align-middle">
          <thead className="bg-gray-100 dark:bg-dark-hover">
            <tr>
              <th className="p-3">Routine ID</th>
              <th className="p-3">Routine Title</th>
              <th className="p-3">Description</th>
              <th className="p-3">Creation Date</th>
              <th className="p-3">Effective From</th>
              <th className="p-3">Effective To</th>
              <th className="p-3">Semester</th>
              <th className="p-3">Batch</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {Array(2)
              .fill(0)
              .map((_, i) => (
                <tr key={i} className="">
                  <td className="p-3 align-middle">ROUT-00{i + 12}</td>
                  <td className="p-3 text-main-blue underline cursor-pointer">
                    Default {i + 1}
                  </td>

                  <td className="p-3">
                    This is the first routine that I just made right now which
                    is default...
                  </td>

                  <td className="p-3">2024/12/15</td>
                  <td className="p-3">2024/12/15</td>
                  <td className="p-3">2024/12/15</td>
                  <td className="p-3">2nd</td>
                  <td className="p-3">2024</td>

                  {/* Status Colors */}
                  <td className="p-3 ">
                    <span
                      className={`px-3 text-xs font-medium ${i % 3 === 0
                          ? "bg-green-100 text-success-green"
                          : i % 3 === 1
                            ? "bg-yellow-100 text-warning-orange"
                            : "bg-red-100 text-error-red"
                        }`}
                    >
                      {i % 3 === 0
                        ? "Approved"
                        : i % 3 === 1
                          ? "Pending"
                          : "Expired"}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-500 cursor-pointer transition">
                        <Eye size={18} />
                      </div>
                      <div className="p-2 rounded-full hover:bg-green-200 dark:hover:bg-green-500 cursor-pointer transition">
                        <Edit size={18} />
                      </div>
                      <div className="p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-500 cursor-pointer transition">
                        <Trash2 size={18} />
                      </div>
                      <div className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer transition">
                        <MoreVertical size={18} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Overview;
