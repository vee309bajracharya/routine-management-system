import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import axiosClient from "../../../services/api/axiosClient";
import { toast } from "react-toastify";

const RoutineSelectionModal = ({ isOpen, onClose, department }) => {
    const navigate = useNavigate();

    // data states
    const [academicData, setAcademicData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // dropdown states
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedBatchId, setSelectedBatchId] = useState("");

    const fetchAcademicStructure = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get(`/public/department/${department.id}/academic-structure`);
            setAcademicData(response.data.data);
        } catch (error) {
            console.error('Failed to load academic details : ', error);
            toast.error("Failed to load academic details");
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && department?.id) {
            fetchAcademicStructure();
        }
    }, [isOpen, department]);

    const handleYearChange = (e) => {
        const yearId = e.target.value;
        const year = academicData.find(y => y.id === yearId);
        setSelectedYear(year);
        setSelectedSemester(null);
        setSelectedBatchId("");
    };

    const handleSemesterChange = (e) => {
        const semId = e.target.value;
        const sem = selectedYear?.semesters.find(s => s.id === semId);
        setSelectedSemester(sem);
        setSelectedBatchId("");
    };

    const handleViewRoutine = async () => {
        if (selectedSemester && selectedBatchId) {
            setIsGenerating(true);
            try {
                const response = await axiosClient.post('public/generate-link', {
                    semester_id: selectedSemester.id,
                    batch_id: selectedBatchId
                });
                if (response.data.success) {
                    // extract the query string from the API's signed URL
                    const signedUrl = response.data.url;
                    const queryString = signedUrl.split('?')[1];
                    navigate(`/routine/view?${queryString}`); // navigate to route with that query string
                    onClose();
                }
            } catch (error) {
                console.error('Failed to generate secure link : ', error);
                toast.error("Failed to generate secure link");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-lg">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold leading-tight">
                            {department.department_name}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Select your academic structure to view the routine</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:text-gray-400 cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center py-10">
                        <Loader2 className="animate-spin text-main-blue mb-2" size={32} />
                        <p className="text-sm dark:text-gray-400">Loading academic structure</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Academic Year Select */}
                        <div>
                            <label className="block text-sm font-semibold mb-2" htmlFor="academic_year">Academic Year</label>
                            <select
                                id="academic_year"
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-main-blue outline-none transition-all"
                                onChange={handleYearChange}
                                value={selectedYear?.id || ""}
                            >
                                <option value="text-gray-900">Select Academic Year</option>
                                {academicData.map(year => (
                                    <option key={year.id} value={year.id}>{year.year_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Semester Select (Enabled if Year is selected) */}
                        <div>
                            <label className='block text-sm font-semibold mb-2' htmlFor="semester">
                                Semester
                            </label>
                            <select
                                id="semester"
                                disabled={!selectedYear}
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-main-blue outline-none transition-all"
                                onChange={handleSemesterChange}
                                value={selectedSemester?.id || ""}
                            >
                                <option value="">Select Semester</option>
                                {selectedYear?.semesters.map(sem => (
                                    <option key={sem.id} value={sem.id}>{sem.semester_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Batch Select (Enabled if Semester is selected) */}
                        <div>
                            <label className='block text-sm font-semibold mb-2' htmlFor="batch">
                                Batch
                            </label>
                            <select
                                id="batch"
                                disabled={!selectedSemester}
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-main-blue outline-none transition-all"
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                value={selectedBatchId}
                            >
                                <option value="">Select Batch</option>
                                {selectedSemester?.batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.batch_name} ({batch.shift})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            disabled={!selectedBatchId || isGenerating}
                            onClick={handleViewRoutine}
                            className="auth-btn disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isGenerating && <Loader2 size={16} className="animate-spin" />}
                            {isGenerating ? "Loading..." : "View Routine"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RoutineSelectionModal;