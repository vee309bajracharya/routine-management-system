import React from 'react'
import { Loader2 } from 'lucide-react'
import OverviewTableRow from './OverviewTableRow'

const OverviewTable = ({ routines, isLoading, onView, onEdit, onDeleteConfirm, onStatusChange, onArchiveConfirm }) => {
  if (isLoading) {
    return <div className='flex justify-center items-center py-10'><Loader2 className='animate-spin dark:invert my-5' size={40} /></div>;
  }

  if (!routines || routines.length === 0) {
    return <div className="text-center py-10 text-primary-text dark:text-white">No routines list found</div>;
  }
  return (
    <section className='overflow-x-auto bg-white dark:bg-dark-overlay mt-4 text-primary-text dark:text-white rounded-md'>
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
  )
}

export default OverviewTable