/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../../services/api/axiosClient";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TeacherRoutine = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const routineId = searchParams.get("id");
    const [routineData, setRoutineData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!routineId) {
            navigate("/teacher/schedule");
            return;
        }

        const fetchRoutine = async () => {
            try {
                const response = await axiosClient.get(`/teacher/routine/${routineId}`);
                setRoutineData(response.data.data);
            } catch (e) {
                toast.error("Routine not found or access denied.");
                navigate("/teacher/dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchRoutine();
    }, [routineId, navigate]);

    const uniqueTimeColumns = useMemo(() => {
        if (!routineData?.timeSlots) return [];
        const unique = [];
        const seen = new Set();
        const sortedSlots = [...routineData.timeSlots].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
        );

        sortedSlots.forEach(slot => {
            const timeKey = `${slot.start_time}-${slot.end_time}`;
            if (!seen.has(timeKey)) {
                seen.add(timeKey);
                unique.push(slot);
            }
        });
        return unique;
    }, [routineData]);

    const getEntryForCell = (startTime, endTime, day) => {
        return routineData?.entries.find((entry) =>
            entry.time_slot.start_time === startTime &&
            entry.time_slot.end_time === endTime &&
            entry.day_of_week === day
        );
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-overlay">
            <Loader2 className="animate-spin text-main-blue my-auto" size={40} />
        </div>
    );

    if (!routineData) return null;

    const { routine } = routineData;

    return (
        <section className="min-h-screen font-general-sans">

            <main className="p-4 md:p-8">
                <section className="text-center mb-8">
                    <h1 className="font-bold text-3xl text-main-blue dark:text-white uppercase tracking-tight">
                        {routine.institution?.name}
                    </h1>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {routine.title}
                    </h2>
                    <p className="text-sm text-sub-text font-medium mt-2">
                        {routine.semester?.semester_name || routine.semester?.name} | {routine.batch?.batch_name || routine.batch?.name} | {routine.batch?.shift || 'Morning'} Shift
                    </p>
                </section>

                <div className="overflow-x-auto border border-gray-300 dark:border-box-outline">
                    <table className="w-full border-collapse table-fixed min-w-[1100px]">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-dark-hover">
                                <th className="p-4 border border-gray-300 dark:border-box-outline text-sm font-bold w-32 text-gray-700 dark:text-white">
                                    Day / Time
                                </th>
                                {uniqueTimeColumns.map((slot, idx) => (
                                    <th key={idx} className="p-4 border border-gray-300 dark:border-box-outline text-center">
                                        <div className="text-md font-bold text-gray-800 dark:text-white leading-none">
                                            {slot.start_time} - {slot.end_time}
                                        </div>
                                        <p className="font-medium text-[11px] mt-3 text-sub-text dark:text-white tracking-wider">{slot.name}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((day) => (
                                <tr key={day} className="h-32">
                                    <td className="p-3 bg-gray-100 dark:bg-dark-hover text-center font-semibold text-gray-600 dark:text-gray-300 border-l border-b border-box-outline">
                                        {day}
                                    </td>
                                    {uniqueTimeColumns.map((col) => {
                                        const entry = getEntryForCell(col.start_time, col.end_time, day);
                                        const isBreak = col.slot_type === "Break";

                                        return (
                                            <td key={`${day}-${col.start_time}`} className="p-2 border border-gray-300 dark:border-box-outline align-middle bg-white dark:bg-dark-overlay">
                                                {isBreak ? (
                                                    <div className="flex items-center justify-center h-full">
                                                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300">Break</span>
                                                    </div>
                                                ) : entry ? (
                                                    <div className="flex flex-col items-center text-center p-2">
                                                        <div className="text-[12px] font-semibold leading-tight text-gray-600 dark:text-gray-300">
                                                            {entry.course_assignment.course.course_name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium mt-1">
                                                            {entry.course_assignment.teacher?.user?.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                                                            Room: {entry.room.room_number || entry.room.name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center text-gray-200 dark:text-gray-800">
                                                        <span className="text-xs italic">-</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

        </section>
    );
};

export default TeacherRoutine;