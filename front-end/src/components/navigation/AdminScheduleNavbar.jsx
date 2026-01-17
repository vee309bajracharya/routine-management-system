import Frame from "../../assets/svg/Frame.svg";
import notification from "../../assets/svg/notification.svg";
import { Sun, Moon } from "lucide-react";
import AdminDefaultImage from "../../assets/images/adminDefaultLogo.png";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const AdminScheduleNavbar = ({ setCollapsed, collapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();

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
          <button className="cursor-pointer px-2 py-1">
            <img
              src={notification}
              alt="notification"
              className="w-4 h-4 dark:invert"
            />
          </button>

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
                {user?.name}
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
