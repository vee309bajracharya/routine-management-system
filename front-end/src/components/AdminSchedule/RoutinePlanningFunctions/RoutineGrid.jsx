import { Loader2 } from "lucide-react";
import RoutineCell from "./RoutineCell";
import RoutineEntryModal from "./RoutineEntryModal";
import RoutineEntryEditModal from "./RoutineEntryEditModal";
import { useRoutineEntryModal } from "../../../contexts/RoutineEntryContext";

const RoutineGrid = ({
  routine,
  grid,
  isLoading,
  timeSlots,
  days,
  slotMetadata,
  formatDate,
}) => {

  const { modalMode } = useRoutineEntryModal();

  // loading state
  if (isLoading && !grid) {
    return (
      <div className="flex justify-center items-center py-20 bg-white dark:bg-dark-overlay rounded-md mt-4">
        <Loader2 className="animate-spin dark:invert" size={40} />
      </div>
    );
  }

  // Empty grid state - No time slots configured
  if (!grid || timeSlots.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-dark-overlay rounded-md mt-4">
        <p className="text-sub-text dark:text-white">
          No time slots configured. Please add time slots to create the routine grid.
        </p>
      </div>
    );
  }

  // get shift from routine/batch
  const currentShift = routine.batch?.shift || 'Morning';

  return (
    <section className="mt-9">

      {/* routine header section */}
      <section className="flex flex-col justify-center items-center text-primary-text dark:text-white font-general-sans my-5 leading-6">

        {/* Title */}
        <h3 className="font-semibold text-2xl">{routine.title}</h3>

        {/* Description */}
        <p className="text-lg text-center px-4">
          {routine.description || "No description provided"}
        </p>

        {/* Effective Date Range */}
        <div className="flex justify-between gap-5 text-sm">
          <p>Effective From: {formatDate(routine.effective_from)}</p>
          <p>Effective To: {formatDate(routine.effective_to)}</p>
        </div>

        {/* Semester and Batch Info */}
        <div className="flex items-center gap-4 text-sm mt-1">
          <p>
            Semester: {routine.semester?.name || "N/A"} |
            Batch: {routine.batch?.name || "All Batches"}
          </p>
        </div>
      </section>

      {/* shift */}
      <section className="text-right">
        <span className={`px-3 py-1 rounded-md font-medium text-xs
          ${currentShift === 'Morning' ? 'text-blue-700 dark:text-blue-200' : 'text-orange-700 dark:text-orange-200'}`}>
          {currentShift} Shift
        </span>
      </section>

      {/* routine grid header */}

      {/* Header row - Time slots */}
      <section className="grid grid-cols-[150px_repeat(auto-fit,minmax(200px,1fr))] border border-gray-300">

        {/* First column - "Day/Period" label */}
        <div className="border-r border-gray-300 p-2 font-semibold text-md text-center text-primary-text dark:text-white bg-gray-50 dark:bg-dark-hover flex items-center justify-center sticky left-0 z-10">
          Day/Period
        </div>

        {/* Time slot headers */}
        {timeSlots.map((slot, idx) => (
          <div
            key={idx}
            className="border-r border-gray-300 p-2 font-semibold text-md text-center text-primary-text dark:text-white bg-gray-50 dark:bg-dark-hover flex items-center justify-center"
          >
            <div className="font-semibold">
              {typeof slot === 'object' ? slot.display_label : slot}
            </div>
          </div>
        ))}
      </section>

      {/* grid rows */}
      {days.map((day, dayIdx) => (
        <div
          key={dayIdx}
          className="grid grid-cols-[150px_repeat(auto-fit,minmax(200px,1fr))] border-b border-gray-300 last:border-b"
        >
          {/* Day Name Column (sticky on left) */}
          <div className="border-l border-r border-gray-300 p-2 text-md font-medium bg-gray-50 dark:bg-dark-hover text-primary-text dark:text-white flex items-center justify-center sticky left-0 z-10">
            {day}
          </div>

          {/* Time slot cells for each day */}
          {timeSlots.map((timeSlot, slotIdx) => {
            const slotType = slotMetadata[timeSlot]?.slot_type || 'Lecture';
            const entry = grid[day]?.[timeSlot];

            return (
              <RoutineCell
                key={slotIdx}
                day={day}
                timeSlot={timeSlot}
                slotType={slotType}
                entry={entry}
              />
            );
          })}
        </div>
      ))}

      {/* loading while refreshing grid */}
      {isLoading && grid && (
        <div className="absolute inset-0 bg-white/50 dark:bg-dark-hover/50 flex items-center justify-center z-20">
          <Loader2 className="animate-spin dark:invert" size={40} />
        </div>
      )}

      {/* Routine Entry and Edit Modal */}
      {modalMode === 'create' && <RoutineEntryModal />}
      {modalMode === 'update' && <RoutineEntryEditModal />}
    </section>
  );
};

export default RoutineGrid;