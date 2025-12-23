import { useRoutineEntryModal } from "../../../contexts/RoutineEntryContext";

const RoutineCell = ({ day, timeSlot, slotType, entry }) => {
  const {openCreateModal, openUpdateModal} = useRoutineEntryModal();

  const isBreakTime = () => {
    if (slotType === 'Break') return true;
    return timeSlot && timeSlot.toLowerCase().includes('break');
  };
  const isBreak = isBreakTime();

  // single click - open create modal
  const handleSingleClick = () => {
    // not opening modal for Break slots and if entry already exists
    if (isBreak) return;
    if (entry) return;

    openCreateModal({
      day, timeSlot, slotType
    });
  };

  // double click - open edit modal
  const handleDoubleClick = () => {
    if (isBreak) return;
    if (!entry) return; // allow double click if entry exists

    openUpdateModal({
      day, timeSlot, slotType
    }, entry);
  };

  // Case 1: Break Time Slot (empty cell during break time) → Show BREAK
  if (!entry && isBreak) {
    return (
      <div className="border-r border-gray-300 flex items-center justify-center p-2 min-h-[100px] min-w-[200px] dark:bg-dark-hover">
        <div className="text-center">
          <span className="font-semibold text-[14px] px-4 py-2 font-general-sans uppercase text-primary-text dark:text-white">
            Break
          </span>
        </div>
      </div>
    );
  }

  // Case 2: Filled Cell → Show entry details
  if (entry) {
    return (
      <section
        className="grid-container"
        onDoubleClick={handleDoubleClick}
        title="Double click to edit entry">
        <div className="flex flex-col justify-center items-center px-2 h-full text-[11px] text-center w-full">

          {/* Course Name */}
          <span className="font-semibold line-clamp-2 text-[14px]">
            {entry.course?.name || "N/A"}
          </span>

          {/* Room Name */}
          <span className="text-[12px] text-sub-text dark:text-gray-400 mt-1">
            {entry.room?.name || "N/A"}
          </span>

          {/* Teacher Name */}
          <span className="text-[12px] text-sub-text dark:text-gray-400 mt-1">
            {entry.teacher?.teacher_details?.name || "No Teacher"}
          </span>

          {/* Entry Type Badge (Lecture/Practical) */}
          <span className={`
            text-[10px] mt-1
            ${entry.entry_type === "Lecture"
              ? "text-blue-700 dark:text-blue-200"
              : entry.entry_type === "Practical"
                ? "text-green-700 dark:text-green-200"
                : "text-gray-700 dark:text-gray-200"
            }
          `}>
            {entry.entry_type}
          </span>

          {/* Notes Display */}
          {entry.notes && (
            <div className="text-[9px] text-sub-text dark:text-gray-400 mt-1 line-clamp-2 w-full">
              {entry.notes}
            </div>
          )}

          {/* Cancelled indicator */}
          {entry.is_cancelled && (
            <span className="text-[8px] text-error-red mt-1 font-semibold">
              Cancelled
            </span>
          )}
        </div>
      </section>
    );
  }

  // CASE 3: Empty Cell (no entry, NOT break time) → Show "Click to add entry"
  return (
    <div
      className="grid-container"
      onClick={handleSingleClick}
      title="Click to add entry"
    >
      <div className="text-[10px] text-sub-text dark:text-gray-400 text-center">
        <div>Click to add entry</div>
      </div>
    </div>
  );
};

export default RoutineCell;