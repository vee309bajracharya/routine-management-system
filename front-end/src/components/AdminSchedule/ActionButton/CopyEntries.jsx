import { useState } from "react";
import { Copy, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useRoutine } from "../../../contexts/RoutineContext";
import axiosClient from "../../../services/api/axiosClient";

const CopyEntries = () => {

  const { currentRoutine, routineGrid, fetchRoutineGrid } = useRoutine();
  const [isCopying, setIsCopying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [sourceDay, setSourceDay] = useState('');
  const [targetDays, setTargetDays] = useState([]);

  const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Check if a day has entries
  const hasEntries = (day) => {
    if (!routineGrid || !routineGrid[day]) return false;
    return Object.values(routineGrid[day]).some(entry => entry !== null);
  };

  // Get count of entries for a day
  const getEntriesCount = (day) => {
    if (!routineGrid || !routineGrid[day]) return 0;
    return Object.values(routineGrid[day]).filter(entry => entry !== null).length;
  };

  // Get all days that have entries (potential source days)
  const getDaysWithEntries = () => {
    return allDays.filter(day => hasEntries(day));
  };

  // Check if any day has entries
  const hasAnyEntries = () => {
    return getDaysWithEntries().length > 0;
  };

  // Handle target day selection (checkbox)
  const handleTargetToggle = (day) => {
    setTargetDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  // Handle source day change
  const handleSourceChange = (day) => {
    setSourceDay(day);
    setTargetDays([]); // Clear target days
  };

  // Open modal
  const handleOpenModal = () => {
    if (!hasAnyEntries()) {
      toast.error('No entries found in any day');
      return;
    }
    if (!currentRoutine?.id) {
      toast.error('No routine selected');
      return;
    }

    // Auto-select Sunday as default if it has entries
    const defaultSource = hasEntries('Sunday') ? 'Sunday' : getDaysWithEntries()[0];
    setSourceDay(defaultSource);
    setTargetDays([]);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSourceDay('');
    setTargetDays([]);
  };

  // Validate and show confirmation
  const handleCopyClick = () => {
    if (!sourceDay) {
      toast.error('Please select a source day');
      return;
    }

    if (targetDays.length === 0) {
      toast.error('Please select at least one target day');
      return;
    }

    const sourceCount = getEntriesCount(sourceDay);

    // Check which target days already have entries
    const daysWithExistingEntries = targetDays.filter(day => hasEntries(day));

    // confirmation toast
    toast(({ closeToast }) => (
      <section className="font-general-sans">
        <h2 className="font-semibold mb-2 text-main-blue">
          Copy Entries ?
        </h2>

        {/* Main info */}
        <p className="text-sm mb-2 text-primary-text">
          Copy <span className="font-semibold">{sourceCount} entries</span> from{' '}
          <span className="font-semibold">{sourceDay}</span> to{' '}
          <span className="font-semibold">{targetDays.join(', ')}</span>
        </p>

        {/* warning, if target days have entries */}
        {daysWithExistingEntries.length > 0 && (
          <section className="bg-warning-orange/10 border border-warning-orange/30 rounded-md p-2 mb-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-warning-orange mt-0.5 flex-shrink-0" />
              <div className="text-xs text-sub-text">
                <span className="font-semibold text-warning-orange">Warning:</span>{' '}
                {daysWithExistingEntries.join(', ')} already contain{daysWithExistingEntries.length === 1 ? 's' : ''} entries.
                These may be overwritten if no conflicts occur.
              </div>
            </div>
          </section>
        )}

        {/* Abort info */}
        <p className="text-xs text-sub-text mb-3">
          Operation will abort if any conflict is detected.
        </p>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={closeToast}
            className="px-2 py-1 bg-gray-200 text-primary-text cursor-pointer rounded-md hover:bg-gray-300 transition">
            Cancel
          </button>
          <button
            onClick={async () => {
              closeToast();
              await executeCopy();
            }}
            className="px-2 py-1 bg-main-blue text-white cursor-pointer rounded-md hover:bg-blue-700 transition">
            Copy Entries
          </button>
        </div>
      </section>
    ), { autoClose: false, closeButton: false });
  };

  // Execute copy operation
  const executeCopy = async () => {
    setIsCopying(true);
    handleCloseModal();

    const sourceCount = getEntriesCount(sourceDay);
    const totalEntries = sourceCount * targetDays.length;

    setProgress({
      current: 0,
      total: totalEntries
    });

    try {
      const response = await axiosClient.post('/admin/routine-entries/copy', {
        routine_id: currentRoutine.id,
        source_day: sourceDay,
        target_days: targetDays
      });

      const data = response.data.data;

      if (response.data.success && !data.aborted) {
        // Success - all days copied
        setProgress({
          current: totalEntries,
          total: totalEntries
        });

        // Show success for each day
        // data.days_completed.forEach(dayInfo => {
        //   toast.success(`${dayInfo.day}: ${dayInfo.entries_copied} entries copied`, {
        //     autoClose: 5000
        //   });
        // });

        // Refresh grid
        await fetchRoutineGrid(
          currentRoutine.id,
          currentRoutine.batch?.shift || 'Morning',
          true
        );

        toast.success(
          <section className="font-general-sans">
            <div className="font-semibold">Copy Completed!</div>
            <p className="text-sm mt-1">
              Successfully copied {data.total_copied} entries from {sourceDay}
            </p>
          </section>,
          { autoClose: 5000 }
        );

      } else if (data.aborted) {
        // Conflict detected : all-or-nothing
        setProgress({
          current: data.total_copied,
          total: totalEntries
        });

        toast.error(
          <section className="font-general-sans">
            <div className="font-semibold">Operation Aborted</div>
            <div className="text-sm mt-1">
              Conflict detected on {data.conflict_day}:
              <br />
              {data.conflict_message}
              <p className="text-sm text-sub-text mt-4">No entries were copied</p>
            </div>
          </section>,
          { autoClose: 5000 }
        );
      }

    } catch (error) {
      console.error('Failed to copy entries:', error);

      if (error.response?.status === 422 && error.response?.data?.data) {
        const data = error.response.data.data;

        setProgress({
          current: data.total_copied || 0,
          total: totalEntries
        });

        toast.error(
          <section className="font-general-sans">
            <div className="font-semibold">Operation Aborted</div>
            <div className="text-sm mt-1">
              Conflict detected on {data.conflict_day}:
              <br />
              {data.conflict_message}
              <p className="text-sm text-sub-text mt-4">No entries were copied</p>
            </div>
          </section>,
          { autoClose: 5000 }
        );
      } else {
        toast.error(error.userMessage || 'Failed to copy entries');
      }
    } finally {
      setIsCopying(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // Only show button if any day has entries on cell
  if (!hasAnyEntries()) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpenModal}
        disabled={isCopying}
        className="overview-btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        {isCopying ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Copying... ({progress.current}/{progress.total})
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy Entries
          </>
        )}
      </button>

      {/* Copy Modal */}
      {showModal && (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-overlay rounded-lg w-full max-w-lg mx-4">

            {/* Modal Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-primary-text dark:text-white">
                Copy Routine Entries
              </h2>
              <p className="text-sm text-sub-text dark:text-white mt-1">
                Select source day and target days to copy entries
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* Source Day Selection */}
              <div>
                <label className="form-label mb-2 flex items-center gap-2">
                  Copy FROM{' '}
                  <span className="text-xs text-sub-text font-normal">
                    (Source Day)
                  </span>
                </label>
                <select
                  value={sourceDay}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="dropdown-select">
                  <option value="">Select source day</option>
                  {allDays.map(day => {
                    const count = getEntriesCount(day);
                    const hasData = count > 0;

                    return (
                      <option
                        key={day}
                        value={day}
                        disabled={!hasData}>
                        {day} {hasData ? `(${count} entries)` : '(no entries)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Target Days Selection */}
              <div>
                <label className="form-label mb-2 flex items-center gap-2">
                  Copy TO{' '}
                  <span className="text-xs text-sub-text font-normal">
                    (Target Days)
                  </span>
                </label>

                {!sourceDay ? (
                  <p className="text-sm text-sub-text dark:text-white">
                    Please select a source day first
                  </p>
                ) : (
                  <div className="space-y-2">
                    {allDays.map(day => {
                      const isSameAsSource = day === sourceDay;
                      const isDisabled = isSameAsSource;
                      const isSelected = targetDays.includes(day);
                      const hasData = hasEntries(day);

                      return (
                        <label
                          key={day}
                          className={`
                            flex items-center gap-3 p-3 rounded-md border cursor-pointer transition
                            ${isDisabled
                              ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-50'
                              : isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600'
                                : 'bg-white dark:bg-dark-hover border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                            }
                          `}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTargetToggle(day)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-primary-text dark:text-white">
                              {day}
                            </span>
                            {isSameAsSource && (
                              <span className="ml-2 text-xs text-sub-text">
                                (source day)
                              </span>
                            )}
                            {hasData && !isSameAsSource && (
                              <span className="ml-2 text-xs text-warning-orange">
                                ⚠ Has entries
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary */}
              {sourceDay && targetDays.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3">
                  <p className="text-sm text-primary-text dark:text-white">
                    <span className="font-semibold">Action:</span> Copy{' '}
                    <span className="font-semibold">{getEntriesCount(sourceDay)} entries</span>{' '}
                    from <span className="font-semibold">{sourceDay}</span> to{' '}
                    <span className="font-semibold">{targetDays.length} day(s)</span>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-primary-text dark:text-white hover:bg-gray-50 dark:hover:bg-dark-hover transition cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleCopyClick}
                disabled={!sourceDay || targetDays.length === 0}
                className="px-6 py-2 bg-main-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 cursor-pointer">
                Copy Entries
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default CopyEntries;