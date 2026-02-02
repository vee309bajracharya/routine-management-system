import React from 'react'
import { Loader2 } from 'lucide-react'
import OverviewTableRow from './OverviewTableRow'

const OverviewTable = ({ routines, isLoading, onView, onEdit, onDeleteConfirm, onStatusChange, onArchiveConfirm }) => {
  if (isLoading) {
    return <div className='flex justify-center items-center py-10'><Loader2 className='animate-spin dark:invert my-5 text-main-blue' size={40} /></div>;
  }

  if (!routines || routines.length === 0) {
    return <div className="text-center py-10 text-primary-text dark:text-white">No routines list found</div>;
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-success-green';
      case 'draft':
        return 'bg-yellow-100 text-warning-orange';
      case 'archieved':
        return 'bg-purple-200 text-information-purple';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <section className='hidden md:block overflow-x-auto bg-white dark:bg-dark-overlay mt-4 text-primary-text dark:text-white rounded-md'>
        <table className='w-full text-sm align-middle'>
          <thead className='bg-gray-100 dark:bg-dark-hover'>
            <tr>
              <th className="routine-list-head">Routine ID</th>
              <th className="routine-list-head">Routine Title</th>
              <th className="routine-list-head">Description</th>
              <th className="routine-list-head">Effective From</th>
              <th className="routine-list-head">Effective To</th>
              <th className="routine-list-head">Semester</th>
              <th className="routine-list-head">Batch</th>
              <th className="routine-list-head">Status</th>
              <th className="routine-list-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routines.map(routineValue => (
              <OverviewTableRow
                key={routineValue.id}
                routine={routineValue}
                onView={onView}
                onEdit={onEdit}
                onDeleteConfirm={onDeleteConfirm}
                onArchiveConfirm={onArchiveConfirm}
                onStatusChange={onStatusChange}
              />
            ))}
          </tbody>
        </table>
      </section>

      {/* Mobile Card View */}
      <div className="mobile-card-list md:hidden mt-4">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className="mobile-card-container"
          >
            {/* Header Row */}
            <div className="mobile-header">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="mobile-card-badge">
                    ROUT-{String(routine.id).padStart(3, '0')}
                  </span>
                  <span className="text-xs text-sub-text">
                    {routine.semester?.name || 'N/A'} • {routine.batch?.name || 'N/A'}
                  </span>
                </div>
                <h3
                  className="info-title-click"
                  onClick={() => onView(routine)}
                >
                  {routine.title}
                </h3>
                <p className="text-sm text-sub-text dark:text-gray-400 mt-1 line-clamp-2">
                  {routine.description || 'No description'}
                </p>
              </div>
              <span
                className={`status-indicator ${getStatusColor(routine.status)}`}
              >
                {routine.status.charAt(0).toUpperCase() + routine.status.slice(1)}
              </span>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-box-outline">
              <div>
                <p className="info-label">Effective From</p>
                <p className="info-value">
                  {fmt(routine.effective_from)}
                </p>
              </div>
              <div>
                <p className="info-label">Effective To</p>
                <p className="info-value">
                  {fmt(routine.effective_to)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mobile-card-actions">
              <button
                className="btn-mobile-secondary"
                onClick={() => onView(routine)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              <button
                className="btn-mobile-secondary"
                onClick={() => onEdit(routine)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              {routine.status === 'published' ? (
                <button
                  className="btn-mobile-secondary text-purple-600"
                  onClick={() => onArchiveConfirm(routine)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Archive
                </button>
              ) : (
                <button
                  className="delete-mobile-btn"
                  onClick={() => onDeleteConfirm(routine)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default OverviewTable