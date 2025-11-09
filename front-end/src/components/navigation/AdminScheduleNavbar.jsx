import React, { useState } from "react";
import Frame from "../../assets/svg/Frame.svg";
import downarrow from "../../assets/svg/Downarrow.svg";
import notification from "../../assets/svg/notification.svg";
import search from "../../assets/svg/search.svg";
import { Sun , Moon } from "lucide-react";


const AdminScheduleNavbar = ({setCollapsed,collapsed}) => {
  const [isDark, setIsDark] = useState(false)
  const toggleTheme = () =>{
    setIsDark(!isDark)
  }
  return (
    <nav className="bg-white font-general-sans ">
      <section className="flex items-center justify-between px-3 py-2">
        {/*left tilte */}
        <button
          className="cursor-pointer transition-all duration-300 ease-in-out"
          onClick={() => setCollapsed(!collapsed)}
        >
          <img src={Frame} alt="toggle sidebar" />
        </button>
        {/* center Search bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative   ">
            <img
              src={search}
              alt="search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
            />
            <input
              type="text"
              placeholder="Search by Name/ ID / Email"
              className="w-full pl-10 pr-4 py-2 border border-box-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
            />
          </div>
        </div>
        {/* Right Icons and User Profile */}
        <div className="flex items-center justify-center gap-4">
          <button className="cursor-pointer px-2 py-1">
            <img
              src={notification}
              alt="notification"
              className="w-4 h-4"
              aria-label="notification"
            />
          </button>
          <button onClick={toggleTheme} className="cursor-pointer px-2 py-1" aria-label="theme change">
            {isDark ? (<Moon size={16}/>):(<Sun size={16}/>)}
            
          </button>
          <button className="flex items-center border-l border-box-outline pl-4 gap-2">
            <img alt="" className="w-10 h-10 px-4 rounded-full bg-amber-200" />
            <span className="text-sm front-md text-sub-text">Josh Doe</span>
            <img src={downarrow} alt="" />
          </button>
        </div>
      </section>
    </nav>
  );
};

export default AdminScheduleNavbar;