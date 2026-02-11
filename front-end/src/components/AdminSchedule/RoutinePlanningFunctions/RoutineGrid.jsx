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
  const { modalMode, openCreateModal, openUpdateModal } = useRoutineEntryModal();

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

  // Helper function to check if slot is break
  const isBreakSlot = (timeSlot) => {
    const slotType = slotMetadata[timeSlot]?.slot_type;
    if (slotType === 'Break') return true;
    return timeSlot && timeSlot.toLowerCase().includes('break');
  };

  return (
    <section className="mt-9 relative">
      {/* Routine header section */}
      <section className="flex flex-col justify-center items-center text-primary-text dark:text-white font-general-sans my-5 leading-6">
        <h3 className="font-bold text-xl sm:text-2xl lg:text-3xl text-primary-blue dark:text-main-blue text-center px-4">
          {routine.institution?.name || 'Institution'}
        </h3>
        <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-center px-4">{routine.title}</h3>
        <p className="text-sm sm:text-base lg:text-lg text-center px-4 max-w-2xl">
          {routine.description || "No description provided"}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm mt-2 font-medium text-center">
          <p>Effective From: {fmt(routine.effective_from)} | Effective To: {fmt(routine.effective_to)}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm mt-1 font-medium text-center">
          <p>
            Semester: {routine.semester?.name || "N/A"} |
            Batch: {routine.batch?.name || "All Batches"}
          </p>
        </div>
      </section>

      {/* shift display before routine grid */}
      <section className="text-right mb-2 px-4 lg:px-0">
        <span className={`font-semibold text-xs sm:text-sm
          ${displayedShift.toLowerCase() === 'morning' // case-insensitive
            ? 'text-main-blue'
            : 'text-information-purple'}`}>
          {displayedShift} Shift
        </span>
      </section>

      {/* Desktop Grid View - Hidden on mobile */}
      <section className="hidden lg:block mt-4 overflow-x-auto custom-scrollbar bg-white dark:bg-dark-overlay">
        <div style={{ borderCollapse: 'collapse' }} className="border border-gray-300">
          {/* Header row - Time slots */}
          <section style={{ 
            display: 'grid', 
            gridTemplateColumns: `120px repeat(${displaySlots.length}, 1fr)`,
            minWidth: 'fit-content'
          }}>
            <div className="border-gray-300 border-r border-b p-2 font-semibold text-md text-center text-primary-text dark:text-white bg-gray-100 dark:bg-dark-hover flex items-center justify-center sticky left-0 z-10">
              Day/Period
            </div>
            {displaySlots.map((slot, idx) => (
              <div key={idx} className="border-gray-300 border-r border-b last:border-r-0 p-2 font-semibold text-center bg-gray-100 dark:bg-dark-hover text-primary-text dark:text-white text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                {slot}
              </div>
            ))}
          </section>

          {/* Grid rows */}
          {days.map((day, dayIdx) => (
            <div
              key={dayIdx}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: `120px repeat(${displaySlots.length}, 1fr)`,
                minWidth: 'fit-content'
              }}
              className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
            >
              {/* Day Name Column */}
              <div className="sticky left-0 z-10 bg-gray-50 dark:bg-dark-hover border-r border-b border-gray-300 p-2 font-bold text-sm flex items-center justify-center dark:text-white">
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
        </div>
      </section>

      {/* Mobile Card View - Hidden on desktop */}
      <section className="lg:hidden mt-4 space-y-4 px-2 sm:px-4">
        {days.map((day) => (
          <div key={day} className="bg-white dark:bg-dark-overlay rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            {/* Day Header */}
            <div className="bg-main-blue text-white p-3 sm:p-4">
              <h3 className="font-bold text-lg sm:text-xl">{day}</h3>
            </div>

            {/* Time Slots for this day */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displaySlots.map((timeSlot) => {
                const entry = grid[day]?.[timeSlot];
                const isBreak = isBreakSlot(timeSlot);
                const slotType = slotMetadata[timeSlot]?.slot_type || 'Lecture';

                return (
                  <div key={timeSlot} className="p-3 sm:p-4">
                    {/* Time Slot Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-sub-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium text-primary-text dark:text-white">
                          {timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Entry Content */}
                    {isBreak && !entry ? (
                      // Break Time
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <svg className="w-5 h-5 text-sub-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-sm text-sub-text uppercase">BREAK</span>
                      </div>
                    ) : entry ? (
                      // Has Entry - Show Details
                      <div 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition"
                        onDoubleClick={() => openUpdateModal({ day, timeSlot, slotType }, entry)}
                      >
                        <div className="space-y-2">
                          {/* Course Name */}
                          <div>
                            <p className="text-xs text-sub-text mb-1">Course</p>
                            <p className="font-semibold text-sm text-primary-text dark:text-white">
                              {entry.course_assignment?.course?.name || "N/A"}
                            </p>
                          </div>

                          {/* Room and Teacher */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-sub-text mb-1">Room</p>
                              <p className="text-sm text-primary-text dark:text-white">
                                {entry.room?.name || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-sub-text mb-1">Type</p>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                entry.entry_type === "Lecture"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                              }`}>
                                {entry.entry_type}
                              </span>
                            </div>
                          </div>

                          {/* Teacher */}
                          <div>
                            <p className="text-xs text-sub-text mb-1">Teacher</p>
                            <p className="text-sm text-primary-text dark:text-white">
                              {entry.course_assignment?.teacher?.teacher_details?.name || "No Teacher"}
                            </p>
                          </div>

                          {/* Notes */}
                          {entry.notes && (
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-sub-text mb-1">Notes</p>
                              <p className="text-xs text-primary-text dark:text-white">
                                {entry.notes}
                              </p>
                            </div>
                          )}

                          {/* Cancelled indicator */}
                          {entry.is_cancelled && (
                            <div className="pt-2">
                              <span className="text-xs text-error-red font-semibold bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                                Cancelled
                              </span>
                            </div>
                          )}

                          {/* Edit hint */}
                          <p className="text-[10px] text-sub-text italic mt-2">
                            Double tap to edit
                          </p>
                        </div>
                      </div>
                    ) : (
                      // No Entry - Click to Add
                      <button
                        onClick={() => openCreateModal({ day, timeSlot, slotType })}
                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-main-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-center"
                      >
                        <p className="text-xs text-sub-text dark:text-gray-400">
                          Tap to add entry
                        </p>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

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