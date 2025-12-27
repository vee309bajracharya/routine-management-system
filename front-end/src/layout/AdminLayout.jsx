import React, { useState } from "react";
import AdminSidebar from "../components/navigation/AdminSidebar";
import AdminScheduleNavbar from "../components/navigation/AdminScheduleNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-general-sans dark:bg-DarkDesaturatedBlueCardBG">
      {/* ===== Sidebar (Fixed) ===== */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-box-outline z-30 transition-all duration-500
          ${collapsed ? "w-20" : "w-60"}
        `}
      >
        <AdminSidebar collapsed={collapsed} />
      </aside>

      {/* ===== Main Section ===== */}
      <div
        className={`flex flex-col flex-1 transition-all duration-500 ${collapsed ? "ml-20" : "ml-60"
          }`}
      >
        {/*Navbar (Fixed)*/}
        <header
          className={`fixed top-0 right-0 bg-white border-b border-box-outline z-20 transition-all duration-500 ${collapsed ? "left-20" : "left-60"
            }`}
        >
          <AdminScheduleNavbar
            setCollapsed={setCollapsed}
            collapsed={collapsed}
          />
        </header>

        {/* ===== Dynamic Page Content ===== */}
        <main
          className={`mt-[30px] pt-9 overflow-y-auto h-full transition-all duration-500 dark:bg-dark-overlay`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
