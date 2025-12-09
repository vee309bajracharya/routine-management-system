import OverviewEditModal from "./OverviewFunctionalities/OverviewEditModal";
import OverviewFilters from "./OverviewFunctionalities/OverviewFilters";
import OverviewPagination from "./OverviewFunctionalities/OverviewPagination";
import OverviewTable from "./OverviewFunctionalities/OverviewTable";
import { useRoutineOverview } from "../../hooks/useRoutineOverview";

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
        showDeleteConfirm,
        openEdit,
        closeEdit,
        editingRoutine,
        isEditOpen,
        handleUpdate,

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