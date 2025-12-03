import React, { useState } from "react";
import { Download, Send, CalendarDays } from "lucide-react";
import RoutineCreation from "./ActionButton/RoutineCreation";
import RoutineEntry from "./ActionButton/RoutineEntry";
import EditSchedule from "./ActionButton/EditSchedule";
import SaveSchedule from "./ActionButton/SaveSchedule";
import LoadSchedule from "./ActionButton/LoadSchedule";
import DeleteSchedule from "./ActionButton/DeleteSchedule";
import DateDurationSchedule from "./ActionButton/DateDurationSchedule";
import SendForApproval from "./ActionButton/SendForApproval";

const Reschedule = () => {
  const [showCreateEntryModal, setShowCreateEntryModal] = useState(false);
  const [showCreateRoutineModal, setshowCreateRoutineModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDateDuraitonModal, setShowDateDurationModal] = useState(false);
  const [showSendForApprovalModal, setShowSendForApprovalModal] =
    useState(false);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];
  const periods = Array(4).fill(""); // 4 periods

  return (
    <section className="font-general-sans mt-4">
      {/* Top Controls */}
      <div className="flex justify-between mb-4">
        <h1 className="text-md font-medium">
          Select multiple block to edit.
        </h1>
        <div className="flex justify-center gap-3 text-sm font-medium">
          <span>Department:</span>
          <span>Batch:</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-4 text-xs">
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setshowCreateRoutineModal(true)}
            className="overview-btn "
          >
            Create Routine
          </button>
          <button
            onClick={() => setShowCreateEntryModal(true)}
            className="overview-btn"
          >
            Create Routine Entry
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="overview-btn"
          >
            Edit
          </button>
          <button
            onClick={() => setShowLoadModal(true)}
            className="overview-btn"
          >
            Load
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="overview-btn"
          >
            Save
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="overview-btn flex justify-between gap-1"
          >
            Delete
          </button>

          <button
            onClick={() => setShowDateDurationModal(true)}
            className="overview-btn flex justify-between gap-1"
          >
            <CalendarDays size={16} />
            Add Date Duration
          </button>
        </div>
        <div className="flex justify-center items-center gap-4">
          <button
            className="flex items-center gap-1 bg-primary5-blue px-3 py-2 rounded "
            onClick={() => setShowSendForApprovalModal(true)}
          >
            <Send size={16} />
            Send for Approval
          </button>

          <button className="flex justify-between gap-1 border border-main-blue px-3 py-1 text-main-blue rounded">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-box-outline rounded-md bg-white mt-4">
        {/* Header Row */}
        <div className="grid grid-cols-10 border-b border-box-outline">
          <div className="border-r border-box-outline p-2 font-semibold text-sm text-center bg-gray-50 flex items-center justify-center">
            Day/Period
          </div>

          {Array(8)
            .fill("")
            .map((_, idx) => (
              <div
                key={idx}
                className="border-r border-box-outline p-2 text-xs text-center bg-white flex flex-col justify-center h-[70px]"
              >
                <div className="font-semibold">
                  {idx % 2 === 0 ? "I" : "II"}
                </div>
                <div className="text-[10px]">10:15–11:55</div>
              </div>
            ))}
        </div>

        {/* Days Rows */}
        {days.map((day, idx) => (
          <div
            key={idx}
            className="grid grid-cols-10 border-b border-box-outline last:border-b-0"
          >
            <div className="border-r border-box-outline p-2 text-sm font-medium bg-gray-50 flex items-center justify-center">
              {day}
            </div>

            {periods.map((_, cIdx) => (
              <div
                key={cIdx}
                className="border-r col-span-2 border-box-outline flex items-center p-4 h-auto pl-2"
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-main-blue cursor-pointer"
                  />
                </div>
                <div className="flex flex-col justify-center items-start ml-2 h-full text-[10px]">
                  <span className="font-semibold">
                    Design of RCC Structure 1
                  </span>
                  <span>Lecture Room [B-407]</span>
                  <span>PP, SKT, KLM</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/*Modal */}
      <RoutineCreation
        isOpen={showCreateRoutineModal}
        onClose={() => setshowCreateRoutineModal(false)}
      />
      <RoutineEntry
        isOpen={showCreateEntryModal}
        onClose={() => setShowCreateEntryModal(false)}
      />
      <EditSchedule
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
      <SaveSchedule
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
      <LoadSchedule
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
      />
      <DeleteSchedule
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
      <DateDurationSchedule
        isOpen={showDateDuraitonModal}
        onClose={() => setShowDateDurationModal(false)}
      />
      <SendForApproval
        isOpen={showSendForApprovalModal}
        onClose={() => setShowSendForApprovalModal(false)}
      />
    </section>
  );
};

export default Reschedule;
