/**
 a fallback, when server doesn't filter
 */
export const filterByDateRange = (routine, dateRange, dateFilter) => {
  // If no effective dates on routine, exclude
  if (!routine?.effective_from || !routine?.effective_to) return false;

  const effFrom = new Date(routine.effective_from);
  const effTo = new Date(routine.effective_to);

  let start, end;
  if (dateFilter === "last7") {
    const now = new Date();
    start = new Date(now);
    start.setDate(start.getDate() - 7);
    end = now;
  } else if (dateFilter === "custom") {
    start = new Date(dateRange.start);
    end = new Date(dateRange.end);
  } else {
    return true; // no filter
  }

  // true if ranges overlap
  return !(effTo < start || effFrom > end);
};
