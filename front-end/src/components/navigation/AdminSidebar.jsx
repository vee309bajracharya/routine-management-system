/* eslint-disable no-unused-vars */
import React from "react";
import MainLogo from "../../assets/svg/default_logo.svg";
import downArrow from "../../assets/svg/Downarrow.svg";
import University from "../../assets/svg/university.svg";
import dash from "../../assets/svg/dashboard.svg";
import schedule from "../../assets/svg/schedule.svg";
import faculty from "../../assets/svg/faculty.svg";
import department from "../../assets/svg/department.svg";
import room from "../../assets/svg/rooms.svg";
import labs from "../../assets/svg/labs.svg";
import activitylog from "../../assets/svg/activitylogsvg.svg";
import settings from "../../assets/svg/setting.svg";
import logout from "../../assets/svg/logout.svg";
import CollapsedLogo from "../../assets/svg/Collapsedlogo.svg";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const sidebarItems = [
  {
    section: "Main",
    items: [
      { to: "/admin/dashboard", icon: dash, label: "Dashboard" },
      { to: "/admin/schedule", icon: schedule, label: "Schedule" },
    ],
  },
  {
    section: "Resources",
    items: [
      { to: "/admin/faculty", icon: faculty, label: "Faculty" },
      { to: "/admin/department", icon: department, label: "Department" },
      { to: "/admin/rooms", icon: room, label: "Rooms" },
      { to: "/admin/labs", icon: labs, label: "Labs" },
    ],
  },
  {
    section: "System",
    items: [
      { to: "/admin/activitylog", icon: activitylog, label: "Activity Log" },
      { to: "/admin/settings", icon: settings, label: "Settings" },
    ],
  },
];

const AdminSidebar = ({ collapsed }) => {
  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex flex-col text-primary-text border-r border-box-outline font-general-sans bg-white overflow-hidden overflow-x-hidden"
    >
      <div className="p-4 flex flex-col border-b border-box-outline h-full overflow-y-auto overflow-x-hidden">
        {/* Sidebar Logo */}
        <motion.div
          animate={{ scale: collapsed ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <img
            src={collapsed ? CollapsedLogo : MainLogo}
            alt="Logo"
            className="h-10 object-contain"
          />
        </motion.div>

        {/* University Section */}
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-start gap-3"
          } mb-4 border border-box-outline rounded-md px-2 py-3 font-semibold transition-all duration-300`}
        >
          <motion.img
            layout="position"
            src={University}
            alt="uni"
            className="w-5 h-5"
            animate={{ scale: collapsed ? 0.9 : 1 }}
          />

          {!collapsed && (
            <>
              <motion.span
                layout="position"
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-primary-text whitespace-nowrap"
              >
                University
              </motion.span>
              <Link className="ml-auto">
                <motion.img
                  layout="position"
                  src={downArrow}
                  alt="down"
                  className="w-4 h-4"
                  animate={{ opacity: collapsed ? 0 : 1 }}
                />
              </Link>
            </>
          )}
        </div>

        {/* Sidebar Sections */}
        {sidebarItems.map((section) => (
          <div key={section.section}>
            {/* Section Title */}
            <motion.h3
              className={`transition-all duration-300 ${
                collapsed
                  ? "text-xs text-center text-sub-text py-1 mb-1"
                  : "side-nav-title text-left"
              }`}
              animate={{ opacity: 1 }}
            >
              {section.section}
            </motion.h3>

            {/* Section Items */}
            {section.items.map((item) => (
              <motion.div key={item.to} layout="position">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `side-nav-link flex items-center ${
                      collapsed ? "justify-center" : "justify-start"
                    } leading-none transition-all duration-300
                    ${
                      isActive
                        ? "bg-main-blue text-white"
                        : "text-primary-text hover:bg-primary6-blue"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <motion.img
                        layout="position"
                        src={item.icon}
                        alt={item.label}
                        className={`w-5 h-5 ${isActive ? "filter invert" : ""}`}
                        animate={{ scale: collapsed ? 0.9 : 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                      {!collapsed && (
                        <motion.span
                          layout="position"
                          initial={false}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-2 overflow-hidden max-w-[200px]"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </div>
        ))}

        {/* Logout Button */}
        <div className="mt-auto">
          <Link
            to="/"
            className={`flex items-center w-full px-3 py-3 ${
              collapsed ? "justify-center" : "justify-start gap-4"
            } border-2 border-main-blue rounded-md hover:bg-primary6-blue text-main-blue transition-all duration-300`}
          >
            <motion.img
              layout="position"
              src={logout}
              className="w-5 h-5"
              alt="logout"
              animate={{ scale: collapsed ? 0.9 : 1 }}
            />
            {!collapsed && (
              <motion.span
                layout="position"
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-2 overflow-hidden max-w-[200px]"
              >
                Logout
              </motion.span>
            )}
          </Link>
        </div>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
