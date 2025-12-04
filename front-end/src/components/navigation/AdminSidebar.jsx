/* eslint-disable no-unused-vars */
import MainLogo from "../../assets/svg/default_logo.svg";
// import downArrow from "../../assets/svg/Downarrow.svg";
// import University from "../../assets/svg/University.svg";
import dash from "../../assets/svg/Dashboard.svg";
import schedule from "../../assets/svg/schedule.svg";
import faculty from "../../assets/svg/faculty.svg";
import department from "../../assets/svg/department.svg";
import room from "../../assets/svg/rooms.svg";
import labs from "../../assets/svg/labs.svg";
import activitylog from "../../assets/svg/activityLog.svg";
import settings from "../../assets/svg/setting.svg";
import logOut from "../../assets/svg/logout.svg";
import CollapsedLogo from "../../assets/svg/collapsedLogo.svg";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const sidebarItems = [
  {
    section: "Main",
    items: [
      {
        to: "/admin/dashboard",
        icon: dash, label: "Dashboard"
      },
      {
        to: "/admin/schedule",
        icon: schedule,
        label: "Schedule"
      },
    ],
  },
  {
    section: "Resources",
    items: [
      {
        to: "/admin/faculty",
        icon: faculty,
        label: "Faculty"
      },
      {
        to: "/admin/department",
        icon: department,
        label: "Department"
      },
      {
        to: "/admin/rooms",
        icon: room,
        label: "Rooms"
      },
      {
        to: "/admin/labs",
        icon: labs,
        label: "Labs"
      },
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

  const { logout, user } = useAuth();
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
      className="h-screen flex flex-col text-primary-text border-r border-box-outline font-general-sans bg-white overflow-hidden overflow-x-hidden dark:bg-dark-overlay"
    >
      <section className="p-4 flex flex-col border-b border-box-outline h-full overflow-y-auto overflow-x-hidden dark:text-white">
        {/* Sidebar Logo */}
        <motion.div
          animate={{ scale: collapsed ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <Link to='/admin/dashboard'>
            <img
              src={collapsed ? CollapsedLogo : MainLogo}
              alt="Logo"
              className="h-10 object-contain dark:invert-25"
            />

          </Link>
        </motion.div>

        {/* University Section */}
        {/* <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-start gap-3"
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
        </div> */}

        {/* Sidebar Sections */}
        {sidebarItems.map((section) => (
          <div key={section.section} className="mt-3">
            {/* Section Title */}
            <motion.h3
              className={`transition-all duration-300 ${collapsed
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
                    `side-nav-link flex items-center ${collapsed ? "justify-center" : "justify-start"
                    } leading-none transition-all duration-300
                    ${isActive
                      ? "bg-main-blue text-white"
                      : "text-primary-text dark:text-white hover:bg-primary6-blue dark:hover:bg-dark-hover"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <motion.img
                        layout="position"
                        src={item.icon}
                        alt={item.label}
                        className={`w-5 h-5 dark:invert ${isActive ? "filter invert" : ""}`}
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
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-3 cursor-pointer ${collapsed ? "justify-center" : "justify-start gap-4"
              } border-1 border-main-blue rounded-md hover:bg-hover-blue hover:outline-0 hover:border-0 hover:text-white dark:hover:bg-hover-blue dark:text-white text-main-blue transition-ease duration-300`}
          >
            <motion.img
              layout="position"
              src={logOut}
              className="w-5 h-5"
              alt="logout"
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
          </button>
        </div>
      </section>
    </motion.aside>
  );
};

export default AdminSidebar;
