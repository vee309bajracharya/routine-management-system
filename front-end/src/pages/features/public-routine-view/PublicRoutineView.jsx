/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from 'framer-motion';
import axiosClient from "../../../services/api/axiosClient";
import PageNotFound from "../../../components/common/PageNotFound";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const PublicRoutineView = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [routineData, setRoutineData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // capture the entire query that includes semester_id, batch_id, expires, and signature
        const queryString = window.location.search;

        if (!searchParams.get("signature")) {
            toast.error("Access denied. Invalid secure link.");
            navigate("/");
            return;
        }

        const fetchRoutine = async () => {
            try {
                // send the whole query string so middleware can verify it
                const response = await axiosClient.get(`/public/view-routine${queryString}`);
                setRoutineData(response.data.data);
            } catch (e) {
                // if signature is expired or tampered with, return 403
                const errorMsg = e.response?.status === 403
                    ? "This link has expired or is invalid."
                    : "Routine not found.";
                toast.error(errorMsg);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchRoutine();
    }, [searchParams, navigate]);

    /**
     * Unique time-slots
     *  extract unique time ranges from the raw timeSlots array to form the grid columns.
     */
    const uniqueTimeColumns = useMemo(() => {
        if (!routineData?.timeSlots) return [];

        const unique = [];
        const seen = new Set();

        // Sort by start_time first to ensure chronological order
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

    // helper to find entry matching a specific Time Range and Day
    const getEntryForCell = (startTime, endTime, day) => {
        return routineData?.entries.find((entry) =>
            entry.time_slot.start_time === startTime &&
            entry.time_slot.end_time === endTime &&
            entry.day_of_week === day
        );
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-primary-blue" size={40} />
            </div>
        );
    }
    if (!routineData) return <PageNotFound />;

    const { routine } = routineData;

    return (
        <section className="min-h-screen bg-white pb-12 font-general-sans">
            {/* Top section */}
            <div className="bg-white sticky top-0 z-30 shadow-sm no-print">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-main-blue transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-main-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all cursor-pointer">
                            <Download size={18} />
                            Download PDF
                        </motion.button>
                    </div>
                </div>
            </div>

            <main className="wrapper">
                {/* Header Info */}
                <section className="text-center mb-6">
                    <h1 className="tracking-tight mt-4 font-bold text-3xl text-primary-blue">
                        {routine.institution.name}
                    </h1>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">
                        {routine.title}
                    </h2>
                    <p className="text-sm text-gray-600 font-medium my-2">
                        {routine.semester.name} | {routine.batch.name} | {routine.batch.shift} Shift
                    </p>

                    <p className="text-sm text-gray-600 font-medium mb-2">
                        Effective From: {new Date(routine.effective_from).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} |
                        Effective To: {new Date(routine.effective_to).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                </section>

                {/* Routine Grid */}
                <div className="overflow-x-auto border border-gray-300">
                    <table className="w-full border-collapse table-fixed min-w-[1100px]">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-3 border border-gray-300 text-sm font-bold w-32 text-gray-700">
                                    Day / Time
                                </th>
                                {uniqueTimeColumns.map((slot, idx) => (
                                    <th key={idx} className="p-3 border border-gray-300 text-center bg-gray-50/50">
                                        <div className="text-md font-bold text-gray-800 leading-none">
                                            {slot.start_time} - {slot.end_time}
                                        </div>
                                        <p className="font-medium text-xs mt-3 text-gray-600">{slot.name}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((day) => (
                                <tr key={day} className="h-32">
                                    <td className="p-3 border border-gray-300 text-center font-bold text-gray-700 bg-gray-50/50">
                                        {day}
                                    </td>
                                    {uniqueTimeColumns.map((col) => {
                                        const entry = getEntryForCell(col.start_time, col.end_time, day);
                                        const isBreak = col.slot_type === "Break";

                                        return (
                                            <td key={`${day}-${col.start_time}`} className="p-2 border border-gray-300 align-middle">
                                                {isBreak ? (
                                                    <div className="flex items-center justify-center h-full">
                                                        <span className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-400 select-none">
                                                            Break
                                                        </span>
                                                    </div>
                                                ) : entry ? (
                                                    <div className="flex flex-col items-center text-center space-y-1">
                                                        <div className="text-[12px] font-semibold text-gray-900 leading-tight px-1 line-clamp-2">
                                                            {entry.course_assignment.course.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-600 font-medium">
                                                            {entry.course_assignment.teacher.teacher_details.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500">
                                                            {entry.room.display_label || entry.room.name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center text-gray-200">
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

                {/* footer */}
                <div className="mt-8 text-right">
                    <div className="text-[11px] text-gray-500 italic">
                        Generated by: {routine.generated_by.name}
                    </div>
                </div>
            </main>

            {/* for download pdf */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: landscape; margin: 1cm; }
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    main { max-width: 100% !important; margin: 0 !important; }
                    .overflow-x-auto { overflow: visible !important; border: none !important; }
                    table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #ccc !important; -webkit-print-color-adjust: exact; }
                }
            `}} />
        </section>
    );
};

export default PublicRoutineView;