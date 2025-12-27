import React, { useRef, useState } from "react";
import { ImageUp } from "lucide-react";

const AdminSettings = () => {
  const [type, setType] = useState("Admin");
  const [logo, setLogo] = useState(null);
  const [logoFileName, setLogoFileName] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // handle file select
  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setLogo(URL.createObjectURL(file));
    setLogoFileName(file.name);
  };

  // browse button
  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  // update logo
  const handleUpdate = () => {
    handleBrowse();
  };

  // delete logo
  const handleDelete = () => {
    setLogo(null);
    setLogoFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <section className="wrapper">
      <div className="max-w-2xl mx-auto p-6 border border-box-outline rounded-md font-general">
        <h1 className="dark:text-white text-2xl font-semibold mb-2">
          Institutional Settings
        </h1>
        <p className="text-sm text-box-outline mb-8">
          Configure key details to personalize your system and establish your
          institution's foundation.
        </p>

        {/* Upload Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-6 border-2 border-dashed rounded-lg bg-white dark:bg-dark-overlay p-8 text-center transition
            ${
              dragActive || logo
                ? "border-main-blue bg-box-outline"
                : "border-box-outline bg-white"
            }
          `}
        >
          {logo ? (
            <div className="space-y-3">
              <img
                src={logo}
                alt="Logo Preview"
                className="mx-auto h-24 object-contain"
              />
              <p className="text-sm text-sub-text">{logoFileName}</p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-3 py-1 bg-main-blue text-white text-sm rounded hover:bg-mouse-pressed-blue transition-colors"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 bg-white text-primary-text text-sm border border-box-outline rounded hover:text-error-red transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mx-auto mb-3 w-10 h-10 rounded-full bg-gray-100">
                <ImageUp size={20} className="text-sub-text" />
              </div>
              <p className="text-sm dark:text-white">Drag and drop your logo to upload</p>
              <p className="text-xs my-2 text-box-outline dark:text-white">or</p>
              <button
                type="button"
                onClick={handleBrowse}
                className="border border-main-blue px-4 py-1 rounded text-sm text-main-blue hover:bg-primary6-blue transition"
              >
                Browse Logo
              </button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Type</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                <input
                  type="radio"
                  checked={type === "Admin"}
                  onChange={() => setType("Admin")}
                />
                Admin
              </label>
              <label className="flex items-center gap-2 cursor-pointer dark:text-white ">
                <input
                  type="radio"
                  checked={type === "Teacher"}
                  onChange={() => setType("Teacher")}
                />
                Teacher
              </label>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="form-title">Name</label>
              <input className="inputbox" placeholder="Enter Full Name" />
            </div>
            <div>
              <label className="form-title">Address</label>
              <input className="inputbox" placeholder="Enter Your Address" />
            </div>
            <div>
              <label className="form-title">Email</label>
              <input className="inputbox" placeholder="Enter Your Email" />
            </div>
            <div>
              <label className="form-title">Phone Number</label>
              <input className="inputbox" placeholder="Enter Phone Number" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button className="cancel-btn">Cancel</button>
            <button className="auth-btn">Submit</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminSettings;