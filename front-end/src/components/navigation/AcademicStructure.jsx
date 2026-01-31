import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
            { to: 'teacher-availability', label: 'Teacher Availability' },
        ]
    },
];

const AcademicStructure = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen font-general-sans">
            {/* Mobile Menu Button only visible on small screens */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-3 left-35 z-50 p-2 bg-white dark:bg-dark-overlay border border-box-outline rounded-md"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? (
                    <X className="w-4 h-4 text-primary-text dark:text-white" />
                ) : (
                    <Menu className="w-4 h-4 text-primary-text dark:text-white" />
                )}
            </button>

            {/* Backdrop for mobile Only visible when menu is open */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Secondary Sidebar (Academic Structure) */}
            <aside
                className={`
                    w-50 flex-shrink-0 border-r border-box-outline bg-white dark:bg-dark-overlay
                    fixed lg:relative inset-y-0 left-0 z-40 
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    overflow-y-auto
                `}
            >
                <div className="p-4 space-y-4">
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
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) =>
                                                `block w-full px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white shadow-sm'
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
            <main className="flex-1 overflow-y-auto w-full lg:w-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AcademicStructure;