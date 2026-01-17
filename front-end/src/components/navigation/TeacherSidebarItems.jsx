import dash from "../../assets/svg/Dashboard.svg";
import schedule from "../../assets/svg/schedule.svg";
import settings from "../../assets/svg/setting.svg";

export const teacherSidebarItems = [
  {
    section: "Main",
    items: [
      { to: "/teacher/dashboard", icon: dash, label: "Dashboard" },
      { to: "/teacher/schedule", icon: schedule, label: "Schedule" },
    ],
  },
  {
    section: "System",
    items: [
      { to: "/teacher/settings", icon: settings, label: "Settings" },
    ],
  },
];
