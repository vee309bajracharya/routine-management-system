import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/navigation/AdminSidebar";
import AdminScheduleNavbar from "../components/navigation/AdminScheduleNavbar";
import { adminSidebarItems } from "../components/navigation/AdminSidebarItems";
import { teacherSidebarItems } from "../components/navigation/TeacherSidebarItems";

const BaseLayout = ({ role }) => {
  const [collapsed, setCollapsed] = useState(true);

  const sidebarItems =
    role === "admin" ? adminSidebarItems : teacherSidebarItems;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        sidebarItems={sidebarItems}
        role={role}
      />

      {/* Right section */}
      <div className="flex flex-col flex-1">
        <AdminScheduleNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          role={role}
        />

        <main className="flex-1 overflow-y-auto p-5 bg-light-bg dark:bg-dark-overlay">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
