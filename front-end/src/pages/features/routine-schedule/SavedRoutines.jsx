import { useEffect } from "react";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useRoutine } from "../../../contexts/RoutineContext";

const SavedRoutines = () => {
    const {
        currentRoutine,
        savedVersions,
        isLoading,
        fetchSavedVersions,
        loadSavedVersion,
        deleteSavedVersion,
    } = useRoutine();

    useEffect(() => {
        if (currentRoutine?.id) {
            fetchSavedVersions(currentRoutine.id);
        }
    }, [currentRoutine, fetchSavedVersions]);

    // confirm delete toast
    const handleConfirmDelete = (version) => {
        toast(
            ({ closeToast }) => (
                <section className="font-general-sans">
                    {/* title */}
                    <span className="font-semibold text-md mb-2 text-error-red">Delete this saved version ?</span>

                    {/* Description */}
                    <p className="text-xs mb-3 mt-2 text-sub-text">
                        This action will delete the selected saved version.
                    </p>

                    {/* action btn */}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => closeToast()}
                            className="px-3 py-1 bg-box-outline text-primary-text cursor-pointer rounded-md transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                closeToast();
                                await deleteSavedVersion(version.id);
                            }}
                            className="px-3 py-1 cursor-pointer rounded-md bg-error-red hover:bg-red-700 text-white transition"
                        >
                            Delete
                        </button>
                    </div>
                </section>
            ), {
            closeButton: false,
            hideProgressBar: true,
            autoClose: false,
        });
    }

    // confirm load version toast
    const handleConfirmLoad = (version) => {
        toast(
            ({ closeToast }) => (
                <section className="font-general-sans">
                    {/* title */}
                    <span className="font-semibold text-md mb-2 text-warning-orange">Load this Routine ?</span>

                    {/* Description */}
                    <p className="text-xs mb-3 mt-2 text-sub-text">
                        Loading this routine version will replace your current setup. Do you want to continue?
                    </p>

                    {/* action btn */}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => closeToast()}
                            className="px-3 py-1 bg-box-outline text-primary-text cursor-pointer rounded-md transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                closeToast();
                                await handleLoadVersion(version);
                            }}
                            className="px-3 py-1 cursor-pointer rounded-md bg-warning-orange text-white transition"
                        >
                            Continue
                        </button>
                    </div>
                </section>
            ), {
            closeButton: true,
            hideProgressBar: true,
            autoClose: false,
        });
    }

    // handle load version
    const handleLoadVersion = async (version) => {
        if (!version?.id || !currentRoutine?.id) {
            toast.error("Invalid version or routine");
            return;
        }
        if (isLoading) return;

        try {
            await loadSavedVersion(version.id, currentRoutine.id);
        } catch (error) {
            console.error("Failed to load version:", error);
            toast.error("Failed to load version");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    };

    // initial state
    if (!currentRoutine) {
        return (
            <section className="mt-4 text-center py-10">
                <p className="text-sub-text dark:text-white">
                    Please select a routine from Overview to view saved versions
                </p>
            </section>
        );
    }

    return (
        <section className="mt-4 font-general-sans px-2 sm:px-0">
            {/* Header */}
            <div className="bg-white dark:bg-dark-overlay rounded-lg p-4 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-primary-text dark:text-white mb-2">
                    Saved Routine Versions for : {currentRoutine.title}
                </h2>
                <p className="text-sm text-sub-text dark:text-white">
                    Load a previously saved version to restore the routine entries
                </p>
            </div>

            {/* Saved Versions List */}
            <div className="bg-white dark:bg-dark-overlay rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="animate-spin mx-auto text-main-blue" size={40} />
                    </div>
                ) : savedVersions.length === 0 ? (
                    <div className="text-center py-10 text-sub-text dark:text-white">
                        No saved versions available for this routine
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <section className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="border-b border-box-outline text-primary-text dark:text-white bg-gray-50 dark:bg-dark-hover font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Saved Version ID</th>
                                        <th className="px-4 py-3">Label</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Saved Date</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedVersions.map((version) => (
                                        <tr
                                            key={version.id}
                                            className="border-b border-box-outline last:border-0 hover:bg-gray-50 dark:hover:bg-dark-hover font-medium text-primary-text dark:text-white">
                                            <td className="p-3 align-middle">
                                                SV-{String(version.id).padStart(3, '0')}
                                            </td>
                                            <td className="p-3">
                                                {version.label}
                                            </td>
                                            <td className="p-3 max-w-xs">
                                                {version.description || "No description"}
                                            </td>
                                            <td className="p-3">
                                                {formatDate(version.saved_date)}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 justify-center">
                                                    {/* preview */}
                                                    <button
                                                        onClick={() => handleConfirmLoad(version)}
                                                        className="p-2 rounded-full hover:bg-orange-200 dark:hover:bg-orange-500 cursor-pointer"
                                                        title="Load version"
                                                    >
                                                        <RotateCcw size={18} className="text-primary-text dark:invert" />
                                                    </button>

                                                    {/* delete */}
                                                    <button
                                                        onClick={() => handleConfirmDelete(version)}
                                                        className="p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-500 cursor-pointer"
                                                        title="Delete version"
                                                    >
                                                        <Trash2 size={18} className="text-primary-text dark:invert" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        {/* Mobile Card View */}
                        <div className="mobile-card-list md:hidden">
                            {savedVersions.map((version) => (
                                <div
                                    key={version.id}
                                    className="mobile-card-container"
                                >
                                    {/* Header Row */}
                                    <div className="mobile-header">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="mobile-card-badge">
                                                    SV-{String(version.id).padStart(3, '0')}
                                                </span>
                                                <span className="text-xs text-sub-text">
                                                    {formatDate(version.saved_date)}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-semibold text-primary-text dark:text-white">
                                                {version.label}
                                            </h3>
                                            <p className="text-sm text-sub-text dark:text-gray-400 mt-1 line-clamp-2">
                                                {version.description || "No description"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mobile-card-actions">
                                        <button
                                            className="btn-mobile-secondary flex-1"
                                            onClick={() => handleConfirmLoad(version)}
                                        >
                                            <RotateCcw size={16} /> Load Version
                                        </button>
                                        <button
                                            className="delete-mobile-btn"
                                            onClick={() => handleConfirmDelete(version)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

        </section>
    );
};

export default SavedRoutines;