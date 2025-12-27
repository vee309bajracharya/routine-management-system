import React, { useState } from "react";

const Rooms = () => {
  const [roomName, setRoomName] = useState("Room 301 / Computer Lab 101");
  const [roomNumber, setRoomNumber] = useState("101");
  const [building, setBuilding] = useState("Block A");
  const [roomType, setRoomType] = useState("Classroom");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ roomName, roomNumber, building, roomType });
  };

  return (
    <div className="mt-5 flex justify-center font-general-sans">
      <div className="bg-white dark:bg-dark-overlay w-[720px] rounded-xl border border-box-outline shadow-sm p-8">
        {/* Title */}
        <h2 className="form-header">Rooms</h2>
        <p className="form-subtext">
          Create login identities for admins and teachers to access the system.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Room Name / Lab and Room Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Room Name / Lab</label>
              <input
                type="text"
                placeholder="Enter Room Name / Lab"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="inputbox"
              />
            </div>
            <div>
              <label className="form-title">Room Number</label>
              <input
                type="text"
                placeholder="Enter Room Number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="inputbox"
              />
            </div>
          </div>

          {/* Building and Room Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-title">Building</label>
              <input
                type="text"
                placeholder="Enter Building"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="inputbox"
              />
            </div>
            <div>
              <label className="form-title">Room Type</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="roomType"
                    value="Classroom"
                    checked={roomType === "Classroom"}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="form-radio"
                  />
                  Classroom
                </label>
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="roomType"
                    value="Hall"
                    checked={roomType === "Hall"}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="form-radio"
                  />
                  Hall
                </label>
                <label className="form-radio-title">
                  <input
                    type="radio"
                    name="roomType"
                    value="Lab"
                    checked={roomType === "Lab"}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="form-radio"
                  />
                  Lab
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button type="button" className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="auth-btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Rooms;