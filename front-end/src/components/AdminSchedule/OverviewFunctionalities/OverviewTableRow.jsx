import { useCallback } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

const OverviewTableRow = ({ routine, onView, onEdit, onDeleteConfirm }) => {

    const handleView = useCallback(() => onView(routine), [onView, routine]);
    const handleEdit = useCallback(() => onEdit(routine), [onEdit, routine]);
    const handleDelete = useCallback(() => onDeleteConfirm(routine), [onDeleteConfirm, routine]);

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-success-green';
            case 'draft':
                return 'bg-yellow-100 text-warning-orange';
            case 'archieved':
                return 'bg-red-100 text-error-red';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <tr className="border-b border-box-outline last:border-0 hover:bg-gray-50 dark:hover:bg-dark-hover font-medium">
            <td className="p-3 align-middle">ROUT-{String(routine.id).padStart(3, '0')}</td>
            <td className="p-3">{routine.title}</td>
            <td className="p-3 max-w-xs">{routine.description || 'No description'}</td>
            <td className="p-3">{fmt(routine.effective_from)}</td>
            <td className="p-3">{fmt(routine.effective_to)}</td>
            <td className="p-3">{routine.semester?.name || 'N/A'}</td>
            <td className="p-3">{routine.batch?.name || 'N/A'}</td>
            <td className="p-3"><span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(routine.status)}`}>{routine.status.charAt(0).toUpperCase() + routine.status.slice(1)}</span></td>
            <td className="p-3">
                <section className="flex items-center gap-2">
                    <button
                        onClick={handleView}
                        className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-500 cursor-pointer">
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={handleEdit}
                        className="p-2 rounded-full hover:bg-green-200 dark:hover:bg-green-500 cursor-pointer">
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-500 cursor-pointer"
                        disabled={routine.status === "published"}>
                        <Trash2 size={18} />
                    </button>
                </section>
            </td>
        </tr>
    )
}

export default OverviewTableRow