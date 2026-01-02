/* eslint-disable no-unused-vars */
import MainLogo from "../../assets/svg/default_logo.svg";
import University from "../../assets/svg/University.svg";
import dash from "../../assets/svg/Dashboard.svg";
import schedule from "../../assets/svg/schedule.svg";
import academicstructure from "../../assets/svg/academicstructure.svg";
import faculty from "../../assets/svg/faculty.svg";
import department from "../../assets/svg/department.svg";
import room from "../../assets/svg/rooms.svg";
import labs from "../../assets/svg/labs.svg";
import activitylog from "../../assets/svg/activityLog.svg";
import settings from "../../assets/svg/setting.svg";
import logOut from "../../assets/svg/logout.svg";
import CollapsedLogo from "../../assets/svg/CollapsedLogo.svg";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useInstitution } from "../../contexts/InstitutionContext";

const sidebarItems = [
  {
    section: "Main",
    items: [
      { to: "/admin/dashboard", icon: dash, label: "Dashboard" },
      { to: "/admin/schedule", icon: schedule, label: "Schedule" },
      { to: "/admin/academic-structure", icon: academicstructure, label: "Academic Structure" },
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
      { to: "/admin/teacher-availability", icon: settings, label: "Teacher Availability" },
    ],
  },
];

const AdminSidebar = ({ collapsed }) => {
  const { institution } = useInstitution();
  const logoSrc = collapsed 
    ? (institution?.logo || CollapsedLogo) 
    : (institution?.logo || MainLogo);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate("/admin-login", { replace: true });
    } catch (error) {
      console.error("Logout failed: ", error);
      toast.error('Logout failed. Please try again');
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex flex-col text-primary-text border-r border-box-outline font-general-sans bg-white overflow-y-auto overflow-x-hidden dark:bg-dark-overlay scrollbar-thin"
    >
      <section className={`p-4 flex flex-col h-full dark:text-white ${collapsed ? "items-center" : ""}`}>
        
        {/* Sidebar Logo */}
        <div className={`mb-6 flex items-center h-10 w-full ${collapsed ? "justify-center" : "justify-start px-1"}`}>
          <Link to='/admin/dashboard'>
            <img src={logoSrc} alt="Logo" className="h-8 w-auto object-contain dark:invert-25" />
          </Link>
        </div>

        {/* University Section */}
        <div className={`flex items-center mb-2 border border-box-outline rounded-md py-3 transition-all duration-300 ${collapsed ? "justify-center w-12" : "justify-start px-3 gap-3 w-full"}`}>
          <img src={University} alt="Icon" className="w-5 h-5 flex-shrink-0 dark:invert" />
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-semibold whitespace-nowrap">
              {institution?.type}
            </motion.span>
          )}
        </div>

        {/* Sidebar Sections */}
        {sidebarItems.map((section) => (
          <div key={section.section} className={`mt-3 w-full ${collapsed ? "flex flex-col items-center" : ""}`}>
            {/* Section Title */}
            <h3 className={`transition-all duration-300 text-sub-text mb-1 uppercase tracking-tighter ${
              collapsed ? "text-[8px] text-center font-bold" : "text-xs font-bold px-3"
            }`}>
              {section.section}
            </h3>

            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center my-1 rounded-md transition-all duration-300 h-11 ${collapsed ? "justify-center w-12" : "justify-start px-3 w-full"} ${
                    isActive ? "bg-main-blue text-white" : "text-primary-text dark:text-white hover:bg-primary6-blue dark:hover:bg-dark-hover"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={item.icon}
                      alt={item.label}
                      className={`w-5 h-5 flex-shrink-0 dark:invert ${isActive ? "filter invert" : ""}`}
                    />
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 whitespace-nowrap overflow-hidden text-sm">
                        {item.label}
                      </motion.span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        {/* Logout Button */}
        <div className={`mt-auto pt-4 w-full ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center border border-main-blue rounded-md text-main-blue hover:bg-main-blue hover:text-white transition-all duration-300 h-11 ${collapsed ? "justify-center w-12" : "justify-start px-3 w-full"}`}
          >
            <img src={logOut} className="w-5 h-5 flex-shrink-0" alt="logout" />
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 whitespace-nowrap text-sm">
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </section>
    </motion.aside>
  );
};

export default AdminSidebar;