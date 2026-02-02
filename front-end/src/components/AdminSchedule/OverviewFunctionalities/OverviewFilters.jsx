import { Calendar, ChevronDown, ChevronUp, Search, X, History } from "lucide-react";

const OverviewFilters = ({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter, dateFilter, setDateFilter, dateRange, setDateRange,
  onApplyDateRange, onClearDateRange, onToggleLast7, statusCounts }) => {
  return (
    <section className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-3">

        {/* last 7 days  */}
        <div className="relative w-full sm:w-auto">
          <button onClick={onToggleLast7} className={`overview-btn w-full sm:w-auto justify-between sm:justify-center ${dateFilter === 'last7' ? 'bg-hover-blue text-white' : ''}`}>
            <div className="flex items-center gap-2">
              <History size={16} />
              <span>Last 7 days</span>
            </div>
            {dateFilter === 'last7' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Date Range */}
        <div className="relative w-full sm:w-auto">
          <button onClick={() => setDateFilter(dateFilter === 'custom' ? 'all' : 'custom')} className={`overview-btn w-full sm:w-auto justify-between sm:justify-center ${dateFilter === 'custom' ? 'bg-hover-blue text-white' : ''}`}>
            <div className="flex items-center gap-2 min-w-0">
              <Calendar size={16} className="flex-shrink-0" />
              <span className="truncate">
                {dateFilter === 'custom' && dateRange.start && dateRange.end
                  ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
                  : 'Routine Date Range'}
              </span>
            </div>
            <ChevronDown size={16} className="flex-shrink-0" />
          </button>

          {dateFilter === 'custom' && (
            <div className="absolute top-full mt-2 left-0 right-0 sm:left-0 sm:right-auto bg-white dark:bg-dark-overlay border border-box-outline rounded-md shadow-lg p-4 z-10 sm:min-w-[300px]">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-sub-text dark:text-white mb-1 block">Effective From</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-2 py-1 border border-box-outline rounded text-sm text-primary-text dark:text-white" />
                </div>
                <div>
                  <label className="text-xs text-sub-text dark:text-white mb-1 block">Effective To</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-2 py-1 border border-box-outline rounded text-sm text-primary-text dark:text-white" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onApplyDateRange}
                    disabled={!dateRange.start || !dateRange.end}
                    className="flex-1 px-3 py-1 bg-mouse-pressed-blue text-white rounded text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Apply</button>

                  <button
                    onClick={onClearDateRange}
                    className="px-3 py-1 border border-box-outline rounded text-sm text-primary-text dark:text-white cursor-pointer">Clear</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 w-full sm:w-auto">
          {['all', 'draft', 'published', 'archieved'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`overview-status-btn flex-shrink-0 ${statusFilter === s ? 'bg-hover-blue text-primary-text' : ''}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} <span className={statusFilter === s ? 'text-primary-text' : 'text-sub-text'}>{statusCounts?.[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
        <div className="flex items-center gap-2 border border-box-outline rounded-md px-3 py-2 bg-white dark:bg-dark-overlay w-full sm:w-auto">
          <Search size={16} className="text-sub-text dark:text-white flex-shrink-0" />
          <input
            type="text"
            placeholder="Search Routine"
            id="search"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            className="outline-none text-sm text-primary-text dark:text-white bg-transparent flex-1 sm:w-48" />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="text-sub-text dark:text-white flex-shrink-0"><X size={14} className="cursor-pointer" /></button>}
        </div>
      </div>


    </section>
  )
}

export default OverviewFilters