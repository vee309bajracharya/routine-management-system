import React from "react";
import { NavLink, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Overview from "../../../components/AdminSchedule/Overview";
import RoutinePlanning from "../../../components/AdminSchedule/RoutinePlanning";
import Reschedule from "../../../components/AdminSchedule/Reschedule";
import SavedRoutines from "../../../components/AdminSchedule/SavedRoutine";

const AdminSchedulePage = () => {
  const location = useLocation();

  const getHeading = () => {
    if (location.pathname.includes("overview")) return "Overview";
    if (location.pathname.includes("routine")) return "Routine Planning";
    if (location.pathname.includes("reschedule")) return "Reschedule";
    if (location.pathname.includes("saved-routines")) return "Saved Routines";
    return "Schedule";
  };

  const tabs = [
    { name: "Overview", path: "/admin/schedule/overview" },
    { name: "Routine Planning", path: "/admin/schedule/routine" },
    { name: "Reschedule", path: "/admin/schedule/reschedule" },
    { name: "Saved Routines", path: "/admin/schedule/saved-routines" },
  ];

  return (
    <section className="flex-1 bg-white dark:bg-dark-overlay rounded-md p-2 font-general-sans">
      {/* Header */}
      <div className="border-b border-box-outline mb-4">
        <h1 className="text-3xl font-semibold mb-4 dark:text-white">{getHeading()}</h1>

        {/* Tabs */}
        <div className="flex space-x-6 text-sm">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `pb-1 border-b-2 transition ${
                  isActive
                    ? "text-primary-text border-b-main-blue dark:text-white"
                    : "text-sub-text border-transparent hover:text-hover-blue hover:border-b-main-blue dark:text-white"
                }`
              }
            >
              {tab.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="">
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="routine" element={<RoutinePlanning />} />
          <Route path="reschedule" element={<Reschedule />} />
          <Route path="saved-routines" element={<SavedRoutines />} />
        </Routes>
      </div>
    </section>
  );
};

export default AdminSchedulePage;
