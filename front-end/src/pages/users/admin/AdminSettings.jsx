/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useInstitution } from "../../../contexts/InstitutionContext";
import { useFormik } from "formik";
import { InstitutionValidationSchema } from "../../../validations/InstitutionValidationSchema";

const AdminSettings = () => {
  const {
    institution,
    updateInstitution,
    deleteInstitutionLogo,
    fetchInstitution,
    loading,
  } = useInstitution();
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFileName, setLogoFileName] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch only if data does not exist
    const fetchDetails = async () => {
      if (!institution) {
        await fetchInstitution();
      }
    };
    fetchDetails();
  }, [institution]);

  //prefetch logo from back-end
  useEffect(() => {
    if (institution?.logo) {
      setLogoPreview(institution.logo);
    }
  }, [institution]);

  // handle file select
  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setLogoPreview(URL.createObjectURL(file));
    setLogoFile(file);
    setLogoFileName(file.name);
  };

  // browse button
  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  // delete logo
  const handleDeletelogo = async () => {
    await deleteInstitutionLogo();
    setLogoPreview(null);
    setLogoFile(null);
    setLogoFileName(null);
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

  //formik setup
  const formik = useFormik({
    initialValues: {
      institution_name: institution?.institution_name || "",
      type: institution?.type,
      address: institution?.address || "",
      contact_email: institution?.contact_email,
      contact_phone: institution?.contact_phone || "",
    },
    validationSchema: InstitutionValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          formData.append(key, value);
        });
        if (logoFile) {
          formData.append("logo", logoFile);
        }
        await updateInstitution(formData);
      } catch (error) {
        throw new error();
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { values, errors, touched, handleSubmit, handleChange } = formik;
  //Loader show while fetching data
  if (loading && !institution) {
    return (
      <div className="wrapper flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-main-blue mb-2" />
        <p className="text-sm text-sub-text animate-pulse font-medium">
          Loading institutional settings...
        </p>
      </div>
    );
  }
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
              dragActive || logoPreview
                ? "border-main-blue bg-box-outline"
                : "border-box-outline bg-white"
            }
          `}
        >
          {logoPreview ? (
            <div className="space-y-3">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="mx-auto h-24 object-contain"
              />
              <p className="text-sm text-sub-text">{logoFileName}</p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleBrowse}
                  className="px-3 py-1 bg-main-blue text-white text-sm rounded hover:bg-mouse-pressed-blue transition-colors cursor-pointer"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={handleDeletelogo}
                  className="px-3 py-1 bg-white text-primary-text text-sm border border-box-outline rounded hover:text-error-red transition-colors cursor-pointer"
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
              <p className="text-sm dark:text-white">
                Drag and drop your logo to upload
              </p>
              <p className="text-xs my-2 text-box-outline dark:text-white">
                or
              </p>
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
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Type */}
          <div className="flex gap-6">
            {["University", "College", "School", "Institute"].map(
              (typeValue) => (
                <label
                  key={typeValue}
                  className="flex items-center text-primary-text dark:text-white gap-2"
                >
                  <input
                    type="radio"
                    name="type"
                    value={typeValue}
                    checked={values.type === typeValue}
                    onChange={handleChange}
                  />
                  {typeValue}
                </label>
              )
            )}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-6">
            {[
              ["institution_name", "Institution Name", true],
              ["address", "Address", false],
              ["contact_email", "Email", false],
              ["contact_phone", "Phone", false],
            ].map(([field, label, required]) => (
              <div key={field}>
                <label className="form-title">
                  {label}
                  {required && <span className="text-error-red ml-1">*</span>}
                </label>

                <input
                  name={field}
                  value={values[field]}
                  onChange={handleChange}
                  onBlur={formik.handleBlur}
                  className="dropdown-select"
                />

                {touched[field] && errors[field] && (
                  <p className="text-error-red text-xs mt-3">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div>
            <button className="auth-btn" disabled={isLoading}>
              {isLoading ? (
                <Loader2
                  size={16}
                  className="animate-spin mx-auto dark:invert"
                />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminSettings;
