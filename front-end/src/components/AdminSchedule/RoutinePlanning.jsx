import { useState } from "react";
import { Download } from "lucide-react";
import { useRoutineEntry } from "../../hooks/useRoutineEntry";
import RoutineCreation from "./ActionButton/RoutineCreation";
import SaveSchedule from "./ActionButton/SaveSchedule";
import RoutineGrid from "./RoutinePlanningFunctions/RoutineGrid";
import RoutineStatusManager from "./RoutinePlanningFunctions/RoutineStatusManager";

/**
 * Purpose:
 * Main container for routine planning interface
 * 
 * Responsibilities:
 * - Display routine information
 * - Show routine status (Draft/Published/Archived)
 * - Display routine grid with entries
 * - Provide action buttons for routine operations (Create, Clear, StatusChange, Save, Export)
 * 
 */
const RoutinePlanning = () => {

  const {
    // Routine state
    currentRoutine,
    routineGrid,
    isLoading,
    slotMetadata,

    // CRUD actions
    handleClearRoutine,
    handleUpdateRoutineStatus,

    // Grid utilities
    getTimeSlots,
    getDays,
    formatDate,
  } = useRoutineEntry();

  const [showCreateRoutineModal, setShowCreateRoutineModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Empty Routine state
  if (!currentRoutine) {
    return (
      <section className="font-general-sans mt-4">
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-overlay rounded-md">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-primary-text dark:text-white">
              No Routine Selected
            </h2>
            <p className="text-sub-text dark:text-white">
              Create a new routine or select an existing one from Overview to get started
            </p>
            <button
              onClick={() => setShowCreateRoutineModal(true)}
              className="auth-btn mt-4"
            >
              Create New Routine
            </button>
          </div>
        </div>

        {/* Routine Creation Modal */}
        <RoutineCreation
          isOpen={showCreateRoutineModal}
          onClose={() => setShowCreateRoutineModal(false)}
        />
      </section>
    );
  }

  // Main Container
  return (
    <section className="font-general-sans mt-4">

      <section className="flex justify-between items-center gap-4 text-xs">

        {/* Left actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateRoutineModal(true)}
            className="overview-btn"
          >
            Create Routine
          </button>

          <button
            onClick={handleClearRoutine}
            className="overview-btn"
          >
            Clear All
          </button>
        </div>

        {/* Right status and actions */}
        <div className="flex items-center gap-4">

          {/* status bar */}
          <section className="bg-white dark:bg-dark-overlay rounded-md float-end">
            <RoutineStatusManager
              routine={currentRoutine}
              onStatusUpdate={handleUpdateRoutineStatus}
            />
          </section>

          {/* Save */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="overview-btn"
          >
            Save
          </button>

          {/* Export */}
          <button className="export-btn">
            <Download size={16} />
            Export
          </button>
        </div>
      </section>

      {/* Routine Grid */}
      <RoutineGrid
        routine={currentRoutine}
        grid={routineGrid}
        isLoading={isLoading}
        timeSlots={getTimeSlots()}
        days={getDays()}
        slotMetadata={slotMetadata}
        formatDate={formatDate}
      />

      {/* Routine Creation Modal */}
      <RoutineCreation
        isOpen={showCreateRoutineModal}
        onClose={() => setShowCreateRoutineModal(false)}
      />

      {/* Save Modal */}
      <SaveSchedule
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
    </section>
  );
};

export default RoutinePlanning;