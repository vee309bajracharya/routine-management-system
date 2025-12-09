import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useRoutine } from "../contexts/RoutineContext";
import { filterByDateRange } from "../utils/filterByDateRange";
import { useNavigate } from "react-router-dom";

const useDebounce = (value, delay = 450) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => {
            setDebounced(value);
        }, delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
};

export const useRoutineOverview = () => {
    const navigate = useNavigate();
    // from RoutineContext.jsx
    const {
        fetchRoutines,
        fetchRoutineById,
        updateRoutine,
        deleteRoutine,
        setCurrentRoutine,
        isLoading,
    } = useRoutine();

    // filters - search, status, date, pagination

    // search
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 450);

    // status
    const [statusFilter, setStatusFilter] = useState("all");

    // date
    const [dateFilter, setDateFilter] = useState("all"); // 'all' , 'last7', 'custom'
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    // pagination
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
    });

    // routine edit modal
    const [editingRoutine, setEditingRoutine] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const buildFilters = useCallback(
        (page = 1) => {
            const filters = {};
            if (statusFilter !== "all") filters.status = statusFilter;
            if (debouncedSearch?.trim()) filters.search = debouncedSearch.trim();

            if (dateFilter === "last7") {
                const now = new Date();
                const last7 = new Date(now);
                last7.setDate(last7.getDate() - 7);
                filters.date_from = last7.toISOString().split("T")[0];
                filters.date_to = now.toISOString().split("T")[0];
            } else if (dateFilter === "custom" && dateRange.start && dateRange.end) {
                filters.date_from = dateRange.start;
                filters.date_to = dateRange.end;
            }

            filters.page = page;
            return filters;
        },
        [statusFilter, debouncedSearch, dateFilter, dateRange]
    );

    const loadPage = useCallback(
        async (page = 1) => {
            const filters = buildFilters(page);
            try {
                const res = await fetchRoutines(filters); // expects { data, meta }
                const dataArray = Array.isArray(res?.data) ? res.data : [];
                // fallback client-side filter for safety
                let finalItems = dataArray;
                if (
                    dateFilter === "last7" ||
                    (dateFilter === "custom" && dateRange.start && dateRange.end)
                ) {
                    finalItems = finalItems.filter((r) =>
                        filterByDateRange(r, dateRange, dateFilter)
                    );
                }
                setItems(finalItems);

                if (res?.meta) {
                    setPagination({
                        current_page: res.meta.current_page,
                        last_page: res.meta.last_page,
                        per_page: res.meta.per_page,
                        total: res.meta.total,
                        from: res.meta.from,
                        to: res.meta.to,
                    });
                } else {
                    setPagination((p) => ({
                        ...p,
                        total: finalItems.length,
                        from: finalItems.length ? 1 : 0,
                        to: finalItems.length,
                    }));
                }
            } catch (err) {
                console.error("loadPage error", err);
                toast.error("Failed to load routines");
            }
        },
        [fetchRoutines, buildFilters, dateFilter, dateRange]
    );

    // initial load
    useEffect(() => {
        loadPage(1);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // reload when filters change
    useEffect(() => {
        loadPage(1);
    }, [statusFilter, debouncedSearch, dateFilter, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

    // counts (page-level)
    const statusCounts = useMemo(
        () => ({
            all: pagination.total || items.length,
            draft: items.filter((r) => r.status === "draft").length,
            published: items.filter((r) => r.status === "published").length,
            archived: items.filter((r) => r.status === "archived").length,
        }),
        [items, pagination.total]
    );

    // === routine related actions ====

    // view fetch detailed routine
    const handleView = useCallback(
        async (routine) => {
            try {
                await fetchRoutineById(routine.id);
                setCurrentRoutine(routine);
                navigate("/admin/schedule/routine");
            } catch (error) {
                setCurrentRoutine(routine);
                navigate("/admin/schedule/routine");
                console.error('Failed to fetch routine view : ', error);
            }
        },
        [fetchRoutineById, setCurrentRoutine, navigate]
    );

    // open routine edit modal
    const openEdit = useCallback((routine) => {
        setEditingRoutine(routine);
        setIsEditOpen(true);
    }, []);

    // close routine edit modal
    const closeEdit = useCallback(() => {
        setEditingRoutine(null);
        setIsEditOpen(false);
    }, []);

    // after confirmation, delete routine and reload page
    const doDelete = useCallback(
        async (routineId) => {
            try {
                await deleteRoutine(routineId);
                // adjust page if last item removed
                const isLastItemOnPage =
                    items.length === 1 && pagination.current_page > 1;
                const pageToLoad = isLastItemOnPage
                    ? pagination.current_page - 1
                    : pagination.current_page;
                await loadPage(Math.max(pageToLoad, 1));
                return true;
            } catch (error) {
                console.error("Delete failed : ", error);
                throw error;
            }
        },
        [deleteRoutine, items, pagination, loadPage]
    );

    // show toast confirm with action buttons
    const showDeleteConfirm = useCallback(
        (routine) => {
            toast(
                ({ closeToast }) => (
                    <section className="p-2 font-general-sans">
                        <div className="font-semibold mb-1">Delete "{routine.title}" ?</div>
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
                                        await doDelete(routine.id);
                                        closeToast();
                                    } catch (error) {
                                        console.error("Failed to delete routine : ", error);
                                    }
                                }}
                                className="px-3 py-1 bg-error-red text-white cursor-pointer rounded-md"
                            >
                                Confirm
                            </button>
                        </div>
                    </section>
                ),
                { autoClose: false }
            );
        },
        [doDelete]
    );

    // update routine
    const handleUpdate = useCallback(
        async (id, data) => {
            try {
                await updateRoutine(id, data);
                await loadPage(pagination.current_page);
                return true;
            } catch (error) {
                console.error("Failed to update routine : ", error);
                throw error;
            }
        },
        [updateRoutine, loadPage, pagination.current_page]
    );

    return {
        //data
        items, pagination, isLoading, statusCounts,

        // filters
        searchTerm, setSearchTerm, statusFilter, setStatusFilter, dateFilter, setDateFilter, dateRange, setDateRange,

        // pagination and load
        loadPage,

        // edit
        editingRoutine, isEditOpen, openEdit, closeEdit, handleUpdate,

        // actions
        handleView, showDeleteConfirm,
    };
};
