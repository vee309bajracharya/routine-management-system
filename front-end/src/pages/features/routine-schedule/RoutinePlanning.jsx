import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useRoutineEntry } from "../../../hooks/useRoutineEntry";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../../services/api/axiosClient";
import RoutineCreation from "../../../components/AdminSchedule/ActionButton/RoutineCreation";
import SaveSchedule from "../../../components/AdminSchedule/ActionButton/SaveSchedule";
import RoutineGrid from "../../../components/AdminSchedule/RoutinePlanningFunctions/RoutineGrid";
import RoutineStatusManager from "../../../components/AdminSchedule/RoutinePlanningFunctions/RoutineStatusManager";
import CopyEntries from "../../../components/AdminSchedule/ActionButton/CopyEntries";

/**
 * Purpose:
 * Main container for routine planning interface
 * 
 * Responsibilities:
 * - Display routine information
 * - Show routine status (Draft/Published/Archived)
 * - Display routine grid with entries
 * - Provide action buttons for routine operations (Create, Clear, CopyEntries,  StatusChange, Save, Export)
 * 
 */
const RoutinePlanning = () => {

  const {
    // Routine state
    currentRoutine,
    routineGrid,
    isLoading,
    slotMetadata,

    // CRUD actions
    handleClearRoutine,
    handlePublishRoutine,

    // Grid utilities
    getTimeSlots,
    getDays,
    formatDate,
  } = useRoutineEntry();

  const [showCreateRoutineModal, setShowCreateRoutineModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchParams] = useSearchParams();
  const hasIdInUrl = !!searchParams.get('id');

  // download pdf
  const handleDownloadPdf = async () => {
    if (!currentRoutine?.id) {
      toast.error('Routine not found');
      return;
    }

    setIsDownloading(true);

    try {
      const response = await axiosClient.get(`/admin/routines/export/pdf/${currentRoutine?.id}`, {
        responseType: "blob",
      });

      // filename for pdf
      const routineTitle = currentRoutine?.title || 'Routine';
      const sanitizedTitle = routineTitle.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
      const dateStamp = new Date().toISOString().slice(0, 10);
      const fileName = `${sanitizedTitle}_${dateStamp}.pdf`;

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("PDF download failed", error);
      toast.error("Failed to download routine PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  // if id is in the URL , but the routine hasn't loaded yet
  if (isLoading && hasIdInUrl && !currentRoutine?.institution) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-main-blue" size={40} />
        <p className="mt-2 text-primary-blue">Loading Routine Details...</p>
      </div>
    );
  }

  // Empty Routine state
  if (!currentRoutine) {
    return (
      <section className="font-general-sans mt-4">

        {/* initial state */}
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-overlay rounded-md">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-primary-text dark:text-white">
              No Routine Selected
            </h2>
            <p className="text-sub-text dark:text-white">
              Create a new routine or select an existing one from Overview to get started
            </p>
            <button
              onClick={() => setShowCreateRoutineModal(true)}
              className="auth-btn mt-4"
            >
              Create New Routine
            </button>
          </div>
        </div>

        {/* Routine Creation Modal */}
        <RoutineCreation
          isOpen={showCreateRoutineModal}
          onClose={() => setShowCreateRoutineModal(false)}
        />
      </section>
    );
  }

  // Main Container
  return (
    <section className="font-general-sans mt-4">

      <section className="flex justify-between items-center gap-4 text-xs">

        {/* Left actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateRoutineModal(true)}
            className="overview-btn"
          >
            Create New Routine
          </button>

          <button
            onClick={handleClearRoutine}
            className="overview-btn"
          >
            Clear All
          </button>

          <CopyEntries />
        </div>

        {/* Right status and actions */}
        <div className="flex items-center gap-4">

          {/* status bar */}
          <section className="bg-white dark:bg-dark-overlay rounded-md float-end">
            <RoutineStatusManager
              routine={currentRoutine}
              onPublish={handlePublishRoutine}
            />
          </section>

          {/* Save */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="overview-btn"
          >
            Save
          </button>

          {/* Export */}
          <button
            className={`export-btn flex items-center gap-2 ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleDownloadPdf}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={16} />
                Download
              </>
            )}
          </button>
        </div>
      </section>

      {/* Routine Grid */}
      <RoutineGrid
        routine={currentRoutine}
        grid={routineGrid}
        isLoading={isLoading}
        timeSlots={getTimeSlots()}
        days={getDays()}
        slotMetadata={slotMetadata}
        formatDate={formatDate}
      />

      {/* Routine Creation Modal */}
      <RoutineCreation
        isOpen={showCreateRoutineModal}
        onClose={() => setShowCreateRoutineModal(false)}
      />

      {/* Save Modal */}
      <SaveSchedule
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
    </section>
  );
};

export default RoutinePlanning;