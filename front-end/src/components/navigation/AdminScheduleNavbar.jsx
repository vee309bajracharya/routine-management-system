import Frame from "../../assets/svg/Frame.svg";
import notificationIcon from "../../assets/svg/notification.svg";
import { Sun, Moon } from "lucide-react";
import AdminDefaultImage from "../../assets/images/adminDefaultLogo.png";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext";

const AdminScheduleNavbar = ({ setCollapsed, collapsed, role }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav className="bg-white dark:bg-dark-overlay text-DesaturatedBlueText font-general-sans">
      <section className="flex items-center justify-between px-3 py-2 border-b border-box-outline">
        {/* Left toggle button */}
        <button
          className="cursor-pointer transition-all duration-300 ease-in-out"
          onClick={() => setCollapsed(!collapsed)}
        >
          <img src={Frame} alt="toggle sidebar" className="dark:invert" />
        </button>

        {/* Right icons & profile */}
        <div className="flex items-center gap-4">
          {/* Notification bell - guarded by role */}
          <Link to={role === 'admin' ? "/admin/notifications" : "/teacher/notifications"}
            className="relative p-2 cursor-pointer group"
          >
            <img
              src={notificationIcon}
              alt="notification"
              className="w-4 h-4 dark:invert opacity-80 group-hover:opacity-100"
            />

            {/* Notification red dot */}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error-red border border-white dark:border-dark-overlay"></span>
              </span>
            )}
          </Link>

          <button
            onClick={toggleTheme}
            className="cursor-pointer px-2 py-1 dark:invert"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button className="flex items-center gap-2 pl-4 border-l border-box-outline cursor-pointer">
            <img
              src={AdminDefaultImage}
              alt="admin"
              className="w-10 h-10 rounded-full p-1 border dark:border-white dark:invert-75"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium dark:text-white">
                {user?.name || "System User"}
              </span>
              <span className="text-xs text-sub-text capitalize">
                {user?.role}
              </span>
            </div>
          </button>
        </div>
      </section>
    </nav>
  );
};

export default AdminScheduleNavbar;
