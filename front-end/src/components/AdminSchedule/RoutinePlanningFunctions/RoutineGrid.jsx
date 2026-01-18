import { Loader2 } from "lucide-react";
import RoutineCell from "./RoutineCell";
import RoutineEntryModal from "./RoutineEntryModal";
import RoutineEntryEditModal from "./RoutineEntryEditModal";
import { useRoutineEntryModal } from "../../../contexts/RoutineEntryContext";

const RoutineGrid = ({
  routine,
  grid,
  isLoading,
  timeSlots: initialTimeSlots, //rename
  days,
  slotMetadata,
}) => {
  const { modalMode } = useRoutineEntryModal();

  // determine the "Active" columns from metadata to ensure when shift changes, the columns refresh immediately
  const activeTimeSlots = Object.keys(slotMetadata).sort((a, b) => {
    return (slotMetadata[a].start_time || "").localeCompare(slotMetadata[b].start_time || "");
  });

  // fallback to initial slots if metadata response hasn't loaded yet
  const displaySlots = activeTimeSlots.length > 0 ? activeTimeSlots : initialTimeSlots;

  // initial fetch loading
  if (isLoading && !grid) {
    return (
      <div className="flex justify-center items-center py-20 bg-white dark:bg-dark-overlay rounded-md mt-4">
        <Loader2 className="animate-spin dark:invert" size={40} />
      </div>
    );
  }

  // Empty grid state
  if (!grid || displaySlots.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-dark-overlay rounded-md mt-4">
        <p className="text-sub-text dark:text-white">
          No time slots configured for the current shift.
        </p>
      </div>
    );
  }

  // get routine's actual batch shift
  const displayedShift = routine.batch?.shift || 'Morning';

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  return (
    <section className="mt-9 relative">
      {/* Routine header section */}
      <section className="flex flex-col justify-center items-center text-primary-text dark:text-white font-general-sans my-5 leading-6">
        <h3 className="font-bold text-3xl text-primary-blue dark:text-main-blue">
          {routine.institution?.name || 'Institution'}
        </h3>
        <h3 className="font-semibold text-2xl">{routine.title}</h3>
        <p className="text-lg text-center px-4 max-w-2xl">
          {routine.description || "No description provided"}
        </p>
        <div className="flex items-center gap-4 text-sm mt-2 font-medium">
          <p>Effective From: {fmt(routine.effective_from)} | Effective To: {fmt(routine.effective_to)}</p>
        </div>
        <div className="flex items-center gap-4 text-sm mt-1 font-medium">
          <p>
            Semester: {routine.semester?.name || "N/A"} |
            Batch: {routine.batch?.name || "All Batches"}
          </p>
        </div>
      </section>

      {/* shift display before routine grid */}
      <section className="text-right mb-2">
        <span className={`font-semibold text-xs
          ${displayedShift.toLowerCase() === 'morning' // case-insensitive
            ? 'text-main-blue'
            : 'text-information-purple'}`}>
          {displayedShift} Shift
        </span>
      </section>

      {/* Header row - Time slots */}
      <section className="mt-4 overflow-x-auto border border-gray-300 custom-scrollbar bg-white dark:bg-dark-overlay">
        <div className="min-w-[1000px]">
          <section className="grid grid-cols-[120px_repeat(auto-fit,minmax(180px,1fr))]">
            <div className="border-gray-300 border-r p-2 font-semibold text-md text-center text-primary-text dark:text-white bg-gray-100 dark:bg-dark-hover flex items-center justify-center sticky left-0 z-10">
              Day/Period
            </div>
            {displaySlots.map((slot, idx) => (
              <div key={idx} className="border-gray-300 border-r p-2 font-semibold text-center bg-gray-100 dark:bg-dark-hover text-primary-text dark:text-white">
                {slot}
              </div>
            ))}
          </section>
        </div>
      </section>

      {/* Grid rows */}
      {days.map((day, dayIdx) => (
        <div
          key={dayIdx}
          className="grid grid-cols-[120px_repeat(auto-fit,minmax(150px,1fr))] border border-b border-gray-300 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
        >
          {/* Day Name Column */}
          <div className="sticky left-0 z-10 bg-gray-50 dark:bg-dark-hover border-r border-gray-300 p-2 font-bold text-sm flex items-center justify-center dark:text-white">
            {day}
          </div>

          {/* Time slot cells */}
          {displaySlots.map((timeSlot, slotIdx) => (
            <RoutineCell
              key={`${day}-${timeSlot}-${slotIdx}`}
              day={day}
              timeSlot={timeSlot}
              slotType={slotMetadata[timeSlot]?.slot_type || 'Lecture'}
              entry={grid[day]?.[timeSlot]}
            />
          ))}
        </div>
      ))}

      {/* during shift switch, overlay loading */}
      {isLoading && grid && (
        <div className="absolute inset-0 bg-white/40 dark:bg-dark-overlay/40 flex items-center justify-center z-20 backdrop-blur-[1px]">
          <div className="p-4">
            <Loader2 className="animate-spin text-primary-blue" size={32} />
          </div>
        </div>
      )}

      {/* Modals */}
      {modalMode === 'create' && <RoutineEntryModal />}
      {modalMode === 'update' && <RoutineEntryEditModal />}
    </section>
  );
};

export default RoutineGrid;