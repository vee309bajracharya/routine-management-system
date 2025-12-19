import { toast } from "react-toastify"

/**
 * to manage routine status
 *  - show current routine status
 *  - handle change status via toast
 * 
 * Props : routine, onStatusUpdate
 *  - routine : current routine object
 *  - onStatusUpdate - callback after status change
 */

const RoutineStatusManager = ({ routine, onStatusUpdate }) => {

    // status badge
    const getStatusStyles = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-yellow-100 text-warning-orange';
            case 'published':
                return 'bg-green-100 text-success-green';
            case 'archieved':
                return 'bg-purple-200 text-information-purple';
            default:
                return 'bg-gray-100 text-primary-text';
        }
    };

    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // custom confirmation toast
    const handlePublish = () => {
        toast(
            ({ closeToast }) => (
                <section className="font-general-sans">
                    {/* Title */}
                    <div className="font-semibold mb-2 text-success-green">
                        Publish "{routine.title}"?
                    </div>

                    {/* Description */}
                    <p className="text-sm mb-3 text-sub-text">
                        This will change the status from Draft to Published.
                        Published routines can be archived later.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={closeToast}
                            className="px-3 py-1 bg-box-outline text-primary-text cursor-pointer rounded-md transition">
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await onStatusUpdate(routine.id, 'published');
                                    closeToast();
                                    toast.success('Routine published successfully');
                                } catch (error) {
                                    console.error('Failed to publish routine : ', error);
                                    toast.error('Failed to publish routine');
                                }
                            }}
                            className="px-3 py-1 cursor-pointer rounded-md bg-green-600 text-white transition">
                            Publish
                        </button>
                    </div>
                </section>
            ),
            { autoClose: false, closeButton: false }
        );
    };

    return (
        <section className="flex items-center gap-3">

            {routine.status === 'draft' ? (
                // to show Publish Routine btn only on Draft status
                <button
                    onClick={handlePublish}
                    className="status-btn border border-success-green text-success-green hover:bg-success-green hover:text-white transition-all">
                    Publish Routine
                </button>
            ) : (
                // status badge for Published and Archived status
                <span
                    className={`status-btn ${getStatusStyles(routine.status)}`}>
                    {getStatusLabel(routine.status)}
                </span>
            )}
        </section>
    )
}

export default RoutineStatusManager