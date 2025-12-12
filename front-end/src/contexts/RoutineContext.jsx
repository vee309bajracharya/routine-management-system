import { createContext, useContext, useState, useCallback, useTransition } from "react";
import axiosClient from "../services/api/axiosClient";
import { toast } from "react-toastify";

const RoutineContext = createContext({
  routines: [],
  currentRoutine: null,
  routineGrid: null,
  savedVersions: [],
  isLoading: false,
  isPending: false,
  currentShift: "Morning",
  setCurrentShift: () => { },
  fetchRoutines: () => { },
  fetchRoutineById: () => { },
  createRoutine: () => { },
  updateRoutine: () => { },
  deleteRoutine: () => { },
  archiveRoutine: () => { },
  fetchRoutineGrid: () => { },
  addRoutineEntry: () => { },
  updateRoutineEntry: () => { },
  deleteRoutineEntry: () => { },
  clearRoutine: () => { },
  saveRoutineVersion: () => { },
  fetchSavedVersions: () => { },
  loadSavedVersion: () => { },
  setCurrentRoutine: () => { },
});

export const RoutineProvider = ({ children }) => {
  const [routines, setRoutines] = useState([]);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [routineGrid, setRoutineGrid] = useState(null);
  const [savedVersions, setSavedVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentShift, setCurrentShift] = useState("Morning");
  const [isPending, startTransition] = useTransition();


  //  ========= Routine creation functions ===========
  // fetch routines
  const fetchRoutines = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const url = `/admin/routines${params ? `?${params}` : ''}`;

      const response = await axiosClient.get(url);

      // Laravel Resource Collection Response Structure:
      // {
      //   data: [ /* array of items */ ],
      //   links: { /* pagination links */ },
      //   meta: { /* pagination meta */ }
      // }

      let dataArray = [];
      let metaObj = {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
      };

      // Check if response has 'data' property (Laravel Resource Collection)
      if (response.data && response.data.data) {
        // Laravel Resource Collection format
        dataArray = Array.isArray(response.data.data) ? response.data.data : [];

        // Meta is at the root level in Laravel Resource Collection
        if (response.data.meta) {
          metaObj = {
            current_page: response.data.meta.current_page ?? 1,
            last_page: response.data.meta.last_page ?? 1,
            per_page: response.data.meta.per_page ?? 15,
            total: response.data.meta.total ?? dataArray.length,
            from: response.data.meta.from ?? (dataArray.length ? 1 : 0),
            to: response.data.meta.to ?? dataArray.length,
          };
        }
      } else if (Array.isArray(response.data)) {
        // Direct array response
        dataArray = response.data;
        metaObj.total = dataArray.length;
        metaObj.from = dataArray.length ? 1 : 0;
        metaObj.to = dataArray.length;
      }

      startTransition(() => {
        setRoutines(dataArray);
      });

      return {
        data: dataArray,
        meta: metaObj
      };

    } catch (error) {
      console.error('Failed to fetch routines:', error);
      toast.error(error.userMessage || 'Failed to fetch routines');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single routine by ID
  const fetchRoutineById = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/admin/routines/${id}`);

      if (response.data.success) {
        startTransition(() => {
          setCurrentRoutine(response.data.data);
        });
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to fetch routine:", error);
      toast.error(error.userMessage || "Failed to fetch routine");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new routine
  const createRoutine = useCallback(async (routineData) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/admin/routines", routineData);

      if (response.data.success) {
        toast.success("Routine created successfully");
        startTransition(() => {
          setCurrentRoutine(response.data.data);
        });
        await fetchRoutines(); // Refresh list
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to create routine:", error);
      toast.error(error.userMessage || "Failed to create routine");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRoutines]);

  // Update routine
  const updateRoutine = useCallback(async (id, routineData) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.put(`/admin/routines/${id}`, routineData);

      if (response.data.success) {
        toast.success("Routine details updated successfully");
        startTransition(() => {
          setCurrentRoutine(response.data.data);
        });
        await fetchRoutines(); // Refresh list
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to update routine:", error);
      toast.error(error.userMessage || "Failed to update routine");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRoutines]);

  // Delete routine
  const deleteRoutine = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.delete(`/admin/routines/${id}`);

      if (response.data.success) {
        toast.success("Routine deleted successfully");
        startTransition(() => {
          if (currentRoutine?.id === id) {
            setCurrentRoutine(null);
          }
        });
        await fetchRoutines(); // Refresh list
        return true;
      }
    } catch (error) {
      console.error("Failed to delete routine:", error);
      toast.error(error.userMessage || "Failed to delete routine");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentRoutine, fetchRoutines]);

  // Archive routine
  const archiveRoutine = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.put(`/admin/routines/archive/${id}`);
      if (response.data.success) {
        toast.success('Routine archived successfully');
        startTransition(() => {
          //update current routine if it's being archived
          if (currentRoutine?.id === id) {
            setCurrentRoutine(prev => prev ? { ...prev, status: 'archieved' } : null);
          }
        });
        await fetchRoutines();
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to archive routine:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.userMessage || "Failed to archive routine");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentRoutine, fetchRoutines]);



  const contextValue = {
    routines,
    currentRoutine,
    routineGrid,
    savedVersions,
    isLoading,
    isPending,
    currentShift,
    setCurrentShift,
    fetchRoutines,
    fetchRoutineById,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    archiveRoutine,
    // fetchRoutineGrid,
    // addRoutineEntry,
    // updateRoutineEntry,
    // deleteRoutineEntry,
    // clearRoutine,
    // saveRoutineVersion,
    // fetchSavedVersions,
    // loadSavedVersion,
    // setCurrentRoutine,
  };

  return (
    <RoutineContext.Provider value={contextValue}>
      {children}
    </RoutineContext.Provider>
  );
};

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error("useRoutine must be used within a RoutineProvider");
  }
  return context;
};

export default RoutineContext;