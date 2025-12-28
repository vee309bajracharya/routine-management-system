import OverviewEditModal from "../../../components/AdminSchedule/OverviewFunctionalities/OverviewEditModal";
import OverviewFilters from "../../../components/AdminSchedule/OverviewFunctionalities/OverviewFilters";
import OverviewPagination from "../../../components/AdminSchedule/OverviewFunctionalities/OverviewPagination";
import OverviewTable from "../../../components/AdminSchedule/OverviewFunctionalities/OverviewTable";
import { useRoutineOverview } from "../../../hooks/useRoutineOverview";
import { useCallback } from "react";
import { toast } from "react-toastify";

const Overview = () => {
    const {
        // pagination
        items,
        pagination,
        isLoading,
        statusCounts,

        // filters
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        dateFilter, setDateFilter,
        dateRange, setDateRange,

        // actions
        loadPage,
        handleView,
        openEdit,
        closeEdit,
        editingRoutine,
        isEditOpen,
        handleUpdate,
        handleArchive,
        doDelete,
        handleStatusChange,

    } = useRoutineOverview();

    // helper to apply date range
    const onApplyDateRange = () => {
        setDateFilter('custom');
        loadPage(1);
    };
    const onClearDateRange = () => {
        setDateRange({ start: '', end: '' });
        setDateFilter('all');
        loadPage(1);
    };
    const onToggleLast7 = () => {
        setDateFilter(prev => prev === 'last7' ? 'all' : 'last7');
    };

    // Add archive confirmation function
    const showArchiveConfirm = useCallback((routine) => {
        toast(
            ({ closeToast }) => (
                <section className="p-2 font-general-sans">
                    <div className="font-semibold mb-1 text-purple-950">Archive "{routine.title}"?</div>
                    <p className="text-sm mb-2 text-sub-text">
                        This will change the status from Published to Archived.
                        Archived routines can be deleted later.
                    </p>
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={closeToast}
                            className="px-3 py-1 bg-box-outline text-primary-text cursor-pointer rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await handleArchive(routine.id);
                                    closeToast();
                                } catch (error) {
                                    console.error("Failed to archive routine: ", error);
                                }
                            }}
                            className="px-3 py-1 bg-purple-600 text-white cursor-pointer rounded-md"
                        >
                            Archive
                        </button>
                    </div>
                </section>
            ),
            { autoClose: false }
        );
    }, [handleArchive]);

    // Update the delete confirmation to show archive option
    const showDeleteConfirm = useCallback((routine) => {
        // Original delete confirmation for non-published routines
        toast(
            ({ closeToast }) => (
                <section className="p-2 font-general-sans">
                    <h3 className="font-semibold mb-2 text-error-red">Delete "{routine.title}" ?</h3>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={closeToast}
                            className="px-3 py-1 bg-box-outline text-primary-text cursor-pointer rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await doDelete(routine.id);
                                    closeToast();
                                } catch (error) {
                                    console.error("Failed to delete routine : ", error);
                                }
                            }}
                            className="px-3 py-1 bg-error-red text-white cursor-pointer rounded-md"
                        >
                            Confirm Delete
                        </button>
                    </div>
                </section>
            ),
            { autoClose: false }
        );
    }, [doDelete]);



    return (
        <section className="mt-4">
            <OverviewFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                dateFilter={dateFilter} setDateFilter={setDateFilter}
                dateRange={dateRange} setDateRange={setDateRange}
                onApplyDateRange={onApplyDateRange} onClearDateRange={onClearDateRange} onToggleLast7={onToggleLast7}
                statusCounts={statusCounts}
            />

            <OverviewTable
                routines={items}
                isLoading={isLoading}
                onView={handleView}
                onEdit={(routineValue) => openEdit(routineValue)}
                onDeleteConfirm={(routineValue) => showDeleteConfirm(routineValue)}
                onArchiveConfirm={showArchiveConfirm}
                onStatusChange={handleStatusChange}

            />

            <OverviewPagination
                pagination={pagination}
                loadPage={loadPage}
            />

            <OverviewEditModal
                isOpen={isEditOpen}
                routine={editingRoutine}
                onClose={() => { closeEdit(); }}
                onSubmit={async (values) => {
                    if (!editingRoutine?.id) return;
                    await handleUpdate(editingRoutine.id, values);
                    closeEdit();
                }}
            />
        </section>
    )
}

export default Overview