import Frame from "../../assets/svg/Frame.svg";
import downarrow from "../../assets/svg/Downarrow.svg";
import notification from "../../assets/svg/notification.svg";
import search from "../../assets/svg/search.svg";
import { Sun, Moon } from "lucide-react";
import AdminDefaultImage from '../../assets/images/adminDefaultLogo.png';
import { useTheme } from "../../contexts/ThemeContext";

const AdminScheduleNavbar = ({ setCollapsed, collapsed }) => {

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav className="bg-white dark:bg-dark-overlay text-DesaturatedBlueText font-general-sans">
      <section className="flex items-center justify-between px-3 py-2">
        {/*left title */}
        <button
          className="cursor-pointer transition-all duration-300 ease-in-out"
          onClick={() => setCollapsed(!collapsed)}
        >
          <img src={Frame} alt="toggle sidebar" className="dark:invert" />
        </button>
        {/* center Search bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <img
              src={search}
              alt="search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 dark:invert-25"
            />
            <input
              type="text"
              placeholder="Search by Name/ ID / Email"
              className="w-full pl-10 pr-4 py-2 border border-box-outline rounded-lg focus:outline-none focus:border-1 text-primary-text dark:text-white"
            />
          </div>
        </div>
        {/* Right Icons and User Profile */}
        <div className="flex items-center justify-center gap-4">
          <button className="cursor-pointer px-2 py-1">
            <img
              src={notification}
              alt="notification"
              className="w-4 h-4 dark:invert"
              aria-label="notification"
            />
          </button>
          <button
            onClick={toggleTheme}
            className="cursor-pointer px-2 py-1 dark:invert" aria-label="theme change">
            {isDark ? (<Sun size={16} />) : (<Moon size={16} />)}

          </button>
          <button className="flex items-center border-l border-box-outline pl-4 gap-2 cursor-pointer">
            <img
              src={AdminDefaultImage}
              alt="admin image" className="w-10 h-10 rounded-full p-1 border dark:border-white dark:invert-75" />
            <span className="text-sm front-md text-sub-text dark:text-white">Admin</span>
            <img
              className="dark:invert cursor-pointer"
              src={downarrow} 
              alt="arrow icon" />
          </button>
        </div>
      </section>
    </nav>
  );
};

export default AdminScheduleNavbar;