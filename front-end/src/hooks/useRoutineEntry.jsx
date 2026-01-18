import { useCallback, useEffect } from "react";
import { useRoutine } from "../contexts/RoutineContext";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

export const useRoutineEntry = () => {

    const [searchParams] = useSearchParams();
    const routineIdFromUrl = searchParams.get('id');

    // RoutineContext
    const {
        currentRoutine,
        routineGrid,
        currentShift,
        setCurrentShift,
        isLoading,
        slotMetadata,
        fetchRoutineGrid,
        fetchRoutineById,
        updateRoutine,
        clearRoutine,
    } = useRoutine();

    useEffect(() => {
        const numericId = parseInt(routineIdFromUrl);

        // URL has ID AND (state is empty OR state ID doesn't match URL)
        if (numericId && (!currentRoutine || currentRoutine.id !== numericId)) {
            fetchRoutineById(numericId);
        }
    }, [routineIdFromUrl, currentRoutine?.id, fetchRoutineById, currentRoutine]);

    // load grid when routine or shift changes    
    useEffect(() => {
        if (currentRoutine?.id) {
            const targetShift = currentRoutine.batch?.shift || 'Morning'; // shift for this current routine

            // if the context shift doesn't match the routine shift, update it first
            if (currentShift !== targetShift) {
                setCurrentShift(targetShift);
            }
            fetchRoutineGrid(currentRoutine.id, targetShift); //fetch routine grid details based on correct shift
        }
    }, [currentRoutine?.id, currentRoutine?.batch?.shift, fetchRoutineGrid, setCurrentShift, currentShift]);

    // CRUDs
    const handleClearRoutine = useCallback(() => {
        if (!currentRoutine?.id) return;

        toast(
            ({ closeToast }) => (
                <div className="p-2 font-general-sans">
                    <div className="font-semibold mb-2 text-error-red">
                        Clear all entries from this routine?
                    </div>
                    <p className="text-sm mb-3 text-sub-text">
                        This will permanently delete all entries from the current shift. Before clearing entries save the current routine.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={closeToast}
                            className="px-3 py-1 bg-gray-200 text-primary-text cursor-pointer rounded-md hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await clearRoutine(currentRoutine.id, currentShift);
                                    closeToast();
                                } catch (error) {
                                    console.error("Failed to clear routine:", error);
                                }
                            }}
                            className="px-3 py-1 bg-error-red text-white cursor-pointer rounded-md hover:bg-red-700 transition"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false, closeButton: false }
        );
    }, [currentRoutine, currentShift, clearRoutine]);

    // routine status mgmt
    const handleUpdateRoutineStatus = useCallback(async (routineGrid, newStatus) => {
        try {
            await updateRoutine(routineGrid, { status: newStatus });
            return true;
        } catch (error) {
            console.error("Failed to update routine status : ", error);
            throw error;
        }
    }, [updateRoutine]);

    // routine grid utilities
    const getTimeSlots = useCallback(() => {
        // keys from metadata
        const metadataKeys = Object.keys(slotMetadata);
        if (metadataKeys.length > 0) {
            // sort keys by their start_time from metadata response
            return metadataKeys.sort((a, b) => {
                return (slotMetadata[a].start_time || "").localeCompare(slotMetadata[b].start_time || "");
            });
        }

        // fallback: if metadata is empty, look at the grid
        if (!routineGrid) return [];
        const days = Object.keys(routineGrid);
        if (days.length === 0) return [];
        return Object.keys(routineGrid[days[0]] || {});
    }, [slotMetadata, routineGrid]);

    // get all working days
    const getDays = useCallback(() => {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    }, []);

    // format date display
    const formatDate = useCallback((dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    }, []);


    return {
        // State
        currentRoutine,
        routineGrid,
        currentShift,
        setCurrentShift,
        isLoading,
        slotMetadata,

        // CRUD operations
        handleClearRoutine,
        handleUpdateRoutineStatus,
        fetchRoutineGrid,
        fetchRoutineById,
        updateRoutine,
        clearRoutine,

        // Utilities
        getTimeSlots,
        getDays,
        formatDate,
    };
};