import { useCallback, useEffect } from "react";
import { useRoutine } from "../contexts/RoutineContext";
import { toast } from "react-toastify";

export const useRoutineEntry = () => {

    // RoutineContext
    const {
        currentRoutine,
        routineGrid,
        currentShift,
        isLoading,
        slotMetadata,
        fetchRoutineGrid,
        updateRoutine,
        clearRoutine,
    } = useRoutine();

    // load grid when routine or shift changes    
    useEffect(() => {
        if (currentRoutine?.id) {
            fetchRoutineGrid(currentRoutine.id, currentShift);
        }
    }, [currentRoutine?.id, currentShift, fetchRoutineGrid]);

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

    // extract timeslots from grid
    const getTimeSlots = useCallback(() => {
        if (!routineGrid) return [];
        const days = Object.keys(routineGrid);
        if (days.length === 0) return [];
        return Object.keys(routineGrid[days[0]] || {});
    }, [routineGrid]);


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
        isLoading,
        slotMetadata,

        // CRUD operations
        handleClearRoutine,
        handleUpdateRoutineStatus,

        // Utilities
        getTimeSlots,
        getDays,
        formatDate,
    };
};