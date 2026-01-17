import dash from "../../assets/svg/Dashboard.svg";
import schedule from "../../assets/svg/schedule.svg";
import academicstructure from "../../assets/svg/academicstructure.svg";
import faculty from "../../assets/svg/faculty.svg";
import room from "../../assets/svg/rooms.svg";
import activitylog from "../../assets/svg/activityLog.svg";
import settings from "../../assets/svg/setting.svg";
import department from "../../assets/svg/department.svg";

export const adminSidebarItems = [
  {
    section: "Main",
    items: [
      { to: "/admin/dashboard", icon: dash, label: "Dashboard" },
      { to: "/admin/schedule", icon: schedule, label: "Schedule" },
      {
        to: "/admin/academic-structure",
        icon: academicstructure,
        label: "Academic Structure",
        basePath: "/admin/academic-structure",
      },
    ],
  },
  {
    section: "Resources",
    items: [
      { to: "/admin/faculty", icon: faculty, label: "Faculty" },

      // ACADEMIC DETAILS DROPDOWN
      {
        label: "Academic Details",
        icon: department,
        basePath: "/admin/academic-details",
        children: [
          { label: "Department", to: "/admin/academic-details/department" },
          {
            label: "Academic Year",
            to: "/admin/academic-details/academic-year",
          },
          { label: "Semester", to: "/admin/academic-details/semester" },
          { label: "Batch", to: "/admin/academic-details/batch" },
          { label: "Course", to: "/admin/academic-details/course" },
          { label: "Time Slot", to: "/admin/academic-details/time-slot" },
          { label: "Course Assignment", to: "/admin/academic-details/course-assignment" },
          { label: "Teacher Availability", to: "/admin/academic-details/teacher-availability" },
        ],
      },

      { to: "/admin/rooms", icon: room, label: "Rooms" },
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
