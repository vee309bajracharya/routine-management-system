import { Calendar, ChevronDown, ChevronUp, Search, X, Download } from "lucide-react";

const OverviewFilters = ({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter, dateFilter, setDateFilter, dateRange, setDateRange,
  onApplyDateRange, onClearDateRange, onToggleLast7, statusCounts }) => {
  return (
    <section className="w-full flex justify-between items-center flex-wrap gap-3">

      <div className="flex items-center flex-wrap gap-3">

        {/* last 7 days  */}
        <div className="relative">
          <button onClick={onToggleLast7} className={`overview-btn ${dateFilter === 'last7' ? 'bg-hover-blue text-white' : ''}`}>
            Last 7 days
            {dateFilter === 'last7' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Date Range */}
        <div className="relative">
          <button onClick={() => setDateFilter(dateFilter === 'custom' ? 'all' : 'custom')} className={`overview-btn ${dateFilter === 'custom' ? 'bg-hover-blue text-white' : ''}`}>
            <Calendar size={16} />
            {dateFilter === 'custom' && dateRange.start && dateRange.end
              ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
              : 'Date Range'}
            <ChevronDown size={16} />
          </button>

          {dateFilter === 'custom' && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-dark-overlay border border-box-outline rounded-md shadow-lg p-4 z-10 min-w-[300px]">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-sub-text dark:text-white mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-2 py-1 border border-box-outline rounded text-sm text-primary-text dark:text-white" />
                </div>
                <div>
                  <label className="text-xs text-sub-text dark:text-white mb-1 block">End Date</label>
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
                    className="flex-1 px-3 py-1 bg-mouse-pressed-blue text-white rounded text-sm cursor-pointer">Apply</button>

                  <button
                    onClick={onClearDateRange}
                    className="px-3 py-1 border border-box-outline rounded text-sm text-primary-text dark:text-white cursor-pointer">Clear</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {['all', 'draft', 'published', 'archieved'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`overview-status-btn ${statusFilter === s ? 'bg-hover-blue text-primary-text' : ''}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} <span className={statusFilter === s ? 'text-primary-text' : 'text-sub-text'}>{statusCounts?.[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Download */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 border border-box-outline rounded-md px-3 py-1 bg-white dark:bg-dark-overlay">
          <Search size={16} className="text-sub-text dark:text-white" />
          <input
            type="text"
            placeholder="Search Routine"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm text-primary-text dark:text-white bg-transparent w-48" />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="text-sub-text dark:text-white"><X size={14} className="cursor-pointer" /></button>}
        </div>

        <button className="export-btn cursor-pointer">
          <Download size={16} /> Download
        </button>
      </div>


    </section>
  )
}

export default OverviewFilters