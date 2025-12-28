import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const sidebarItems = [
    {
        section: "Foundational",
        items: [
            { to: 'user-accounts', label: 'User Accounts' },
        ]
    },
    {
        section: "Curriculum",
        items: [
            { to: 'academic-departments', label: 'Departments' },
            { to: 'teachers', label: 'Teachers' },
            { to: 'academic-years', label: 'Academic Years' },
            { to: 'semesters', label: 'Semesters' },
            { to: 'batches', label: 'Batches' },
            { to: 'courses', label: 'Courses' },
        ]
    },
    {
        section: "Resources",
        items: [
            { to: 'rooms', label: 'Rooms' },
        ]
    },
    {
        section: "Scheduling",
        items: [
            { to: 'time-slots', label: 'Time Slots' },
            { to: 'course-assignments', label: 'Course Assignments' },
        ]
    },
];

const AcademicStructure = () => {
    return (
        <div className="flex min-h-screen font-general-sans ">
            {/* Secondary Sidebar (Academic Structure) */}
            <aside className="w-50  flex-shrink-0 border-r border-box-outline bg-white dark:bg-dark-overlay">
                <div className="p-4 space-y-4 ">
                    {sidebarItems.map((section) => (
                        <div key={section.section} className="space-y-1">
                            <h3 className="text-xs tracking-wider text-sub-text font-semibold mb-2 dark:sub-text">
                                {section.section}
                            </h3>
                            <ul className="space-y-1 border-b border-box-outline pb-5">
                                {section.items.map((item) => (
                                    <li key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            end={item.to === 'user-accounts'}
                                            className={({ isActive }) =>
                                                `block w-full px-3 py-2 rounded-md text-sm transition-colors duration-200 ${isActive
                                                    ? 'bg-blue-600 text-white shadow-sm '
                                                    : 'text-primary-text hover:bg-primary6-blue dark:hover:bg-dark-hover dark:text-white'
                                                }`
                                            }
                                        >
                                            {item.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area (Dynamic) */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AcademicStructure;