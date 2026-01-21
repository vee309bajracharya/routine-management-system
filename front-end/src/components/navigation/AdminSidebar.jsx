/* eslint-disable no-unused-vars */
import { useState } from "react";
import MainLogo from "../../assets/svg/default_logo.svg";
import logOut from "../../assets/svg/logout.svg";
import CollapsedLogo from "../../assets/svg/CollapsedLogo.svg";
import Downarrow from "../../assets/svg/Downarrow.svg";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useInstitution } from "../../contexts/InstitutionContext";

const AdminSidebar = ({ collapsed, sidebarItems, role }) => {
  const { institution } = useInstitution();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const logoSrc = collapsed
    ? institution?.logo || CollapsedLogo
    : institution?.logo || MainLogo;

  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState(() => {
    const activeDropdown = sidebarItems
      .flatMap((section) => section.items)
      .find(
        (item) =>
          item.children &&
          item.basePath &&
          location.pathname.startsWith(item.basePath)
      );

    return activeDropdown ? activeDropdown.label : null;
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate(role === "admin" ? "/admin-login" : "/teacher-login", {
        replace: true,
      });
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex flex-col text-primary-text border-r border-box-outline font-general-sans bg-white overflow-y-auto overflow-x-hidden dark:bg-dark-overlay scrollbar-thin"
    >
      <section
        className={`p-4 flex flex-col h-full dark:text-white ${
          collapsed ? "items-center" : ""
        }`}
      >
        {/* LOGO */}
        <div
          className={`mb-6 flex items-center h-10 w-full ${
            collapsed ? "justify-center" : "justify-start px-1"
          }`}
        >
          <Link to="/admin/dashboard">
            <img
              src={logoSrc}
              alt="Logo"
              className="h-8 w-auto object-contain dark:invert-25"
            />
          </Link>
        </div>

        {/* SIDEBAR ITEMS */}
        {sidebarItems.map((section) => (
          <div
            key={section.section}
            className={`mt-3 w-full ${
              collapsed ? "flex flex-col items-center" : ""
            }`}
          >
            <h3
              className={`transition-all duration-300 text-sub-text mb-1 uppercase tracking-tighter ${
                collapsed
                  ? "text-[8px] text-center font-bold"
                  : "text-xs font-bold px-3"
              }`}
            >
              {section.section}
            </h3>

            {section.items.map((item) => {
              const hasDropdown = item.children && item.children.length > 0;

              // Check if any child is active
              const isActiveByBasePath =
                item.basePath && location.pathname.startsWith(item.basePath);

              const isOpen = openDropdown === item.label;

              // DROPDOWN ITEM
              if (hasDropdown) {
                return (
                  <div key={item.label} className="w-full">
                    <button
                      onClick={() => {
                        if (collapsed) {
                          // If collapsed, navigate directly to first child
                          navigate(item.children[0].to);
                        } else if (item.label === "Academic Details") {
                          // Toggle Academic Details dropdown
                          setOpenDropdown(isOpen ? null : item.label);
                          if (!isOpen) navigate(item.children[0].to); // navigate to first child only when opening
                        } else {
                          // Toggle any other dropdown
                          setOpenDropdown(isOpen ? null : item.label);
                        }
                      }}
                      className={`flex items-center my-1 rounded-md transition-all duration-300 h-11 w-full ${
                        collapsed
                          ? "justify-center w-12"
                          : "justify-start px-3 w-full"
                      } ${
                        isActiveByBasePath || isOpen
                          ? "bg-main-blue text-white"
                          : "text-primary-text hover:bg-primary6-blue dark:hover:bg-dark-hover"
                      }`}
                    >
                      <img
                        src={item.icon}
                        className={`w-5 h-5 flex-shrink-0 ${
                          isActiveByBasePath || isOpen
                            ? "filter invert brightness-0"
                            : "dark:invert"
                        }`}
                        alt=""
                      />

                      {!collapsed && (
                        <>
                          <span className="ml-3 flex-grow text-left dark:text-white text-sm whitespace-nowrap ">
                            {item.label}
                          </span>
                          <motion.img
                            src={Downarrow}
                            className={`w-3 h-3 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            } ${
                              isActiveByBasePath || isOpen
                                ? "filter invert brightness-0"
                                : "dark:invert"
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {/* DROPDOWN CONTENT */}
                    <AnimatePresence>
                      {!collapsed && isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden flex flex-col"
                        >
                          {item.children.map((sub) => (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              onClick={() => setOpenDropdown(item.label)}
                              className={({ isActive }) =>
                                `ml-11 py-2 text-sm transition-all ${
                                  isActive
                                    ? "text-main-blue font-semibold "
                                    : "text-sub-text hover:text-main-blue "
                                }`
                              }
                            >
                              {sub.label}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // NORMAL ITEM
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpenDropdown(null)} // Close any open dropdown
                  className={({ isActive }) =>
                    `flex items-center my-1 rounded-md transition-all duration-300 h-11 ${
                      collapsed
                        ? "justify-center w-12"
                        : "justify-start px-3 w-full"
                    } ${
                      isActive
                        ? "bg-main-blue text-white"
                        : "text-primary-text dark:text-white hover:bg-primary6-blue dark:hover:bg-dark-hover"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <img
                        src={item.icon}
                        className={`w-5 h-5 flex-shrink-0 dark:invert ${
                          isActive ? "filter invert brightness-0" : ""
                        }`}
                        alt=""
                      />
                      {!collapsed && (
                        <span className="ml-3 text-sm">{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* LOGOUT */}
        <div
          className={`mt-auto pt-4 w-full ${
            collapsed ? "flex justify-center" : ""
          }`}
        >
          <button
            onClick={handleLogout}
            className={`flex items-center border border-main-blue rounded-md text-main-blue hover:bg-main-blue hover:text-white transition-all duration-300 h-11 ${
              collapsed ? "justify-center w-12" : "justify-start px-3 w-full"
            }`}
          >
            <img src={logOut} className="w-5 h-5 flex-shrink-0" alt="logout" />
            {!collapsed && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      </section>
    </motion.aside>
  );
};

export default AdminSidebar;
