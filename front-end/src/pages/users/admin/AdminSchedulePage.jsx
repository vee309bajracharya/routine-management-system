import React from "react";
import { NavLink, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Overview from "../../../components/AdminSchedule/Overview";
import RoutinePlanning from "../../../components/AdminSchedule/RoutinePlanning";
import Reschedule from "../../../components/AdminSchedule/Reschedule";
import Saved from "../../../components/AdminSchedule/Saved";

const AdminSchedulePage = () => {
  const location = useLocation();

  const getHeading = () => {
    if (location.pathname.includes("overview")) return "Overview";
    if (location.pathname.includes("routine")) return "Routine Planning";
    if (location.pathname.includes("reschedule")) return "Reschedule";
    if (location.pathname.includes("saved")) return "Saved";
    return "Schedule";
  };

  const tabs = [
    { name: "Overview", path: "/admin/schedule/overview" },
    { name: "Routine Planning", path: "/admin/schedule/routine" },
    { name: "Reschedule", path: "/admin/schedule/reschedule" },
    { name: "Saved", path: "/admin/schedule/saved" },
  ];

  return (
    <section className="flex-1 bg-white rounded-md p-2 font-general-sans">
      {/* Header */}
      <div className="border-b border-box-outline mb-4">
        <h1 className="text-3xl font-semibold mb-4">{getHeading()}</h1>

        {/* Tabs */}
        <div className="flex space-x-6 text-sm">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `pb-1 border-b-2 transition ${
                  isActive
                    ? "text-primary-text border-b-main-blue"
                    : "text-sub-text border-transparent hover:text-primary-text hover:border-b-main-blue"
                }`
              }
            >
              {tab.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="routine" element={<RoutinePlanning />} />
          <Route path="reschedule" element={<Reschedule />} />
          <Route path="saved" element={<Saved />} />
        </Routes>
      </div>
    </section>
  );
};

export default AdminSchedulePage;
