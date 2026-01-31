/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import axiosClient from "../../services/api/axiosClient";
import { toast } from "react-toastify";
import { AdminEditValidationSchema } from "../../validations/AdminEditValidationSchema";

const AdminEditModal = ({ isOpen, onClose, adminData, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: adminData?.name || "",
      email: adminData?.email || "",
      phone: adminData?.phone || "",
      current_password: "",
      password: "",
      password_confirmation: "",
    },
    validationSchema: AdminEditValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  const { values, errors, touched, handleChange, handleBlur, resetForm } = formik;

  async function handleSubmit(values) {
    setIsLoading(true);
    try {
      const cleanValues = {
        ...values,
        phone: values.phone === "" ? null : values.phone,
        current_password: values.current_password === "" ? null : values.current_password,
        password: values.password === "" ? null : values.password,
        password_confirmation:
          values.password_confirmation === "" ? null : values.password_confirmation,
      };

      const updateData = {};

      const hasPersonalInfoChanges =
        cleanValues.name !== adminData.name ||
        cleanValues.email !== adminData.email ||
        cleanValues.phone !== adminData.phone;

      if (hasPersonalInfoChanges) {
        if (cleanValues.name !== adminData.name) updateData.name = cleanValues.name;
        if (cleanValues.email !== adminData.email) updateData.email = cleanValues.email;
        if (cleanValues.phone !== adminData.phone) updateData.phone = cleanValues.phone;
      }

      const hasPasswordChange = cleanValues.password && cleanValues.password.length > 0;

      if (hasPasswordChange) {
        updateData.current_password = cleanValues.current_password;
        updateData.password = cleanValues.password;
        updateData.password_confirmation = cleanValues.password_confirmation;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsLoading(false);
        return;
      }

      const response = await axiosClient.put(`/admin/users/${adminData.id}`, updateData);

      if (response.data.success) {
        let successMessage = "Profile updated successfully";
        if (hasPersonalInfoChanges && hasPasswordChange) {
          successMessage = "Profile and password updated successfully";
        } else if (hasPasswordChange) {
          successMessage = "Password updated successfully";
        } else if (hasPersonalInfoChanges) {
          successMessage = "Profile updated successfully";
        }

        toast.success(response.data.message || successMessage);

        if (response.data.require_login) {
          toast.warning("Please login again with your new password", { autoClose: 3000 });
          setTimeout(() => {
            window.location.href = "/admin-login";
          }, 3000);
          return;
        }

        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      console.error("Update failed:", error);
      const apiError = error.response?.data;

      if (error.response?.status === 422) {
        if (apiError.errors && typeof apiError.errors === "object") {
          const firstError = Object.values(apiError.errors)[0][0];
          toast.error(firstError);
        } else {
          toast.error(apiError.message || "Validation failed");
        }
      } else if (error.response?.status === 403) {
        toast.error(apiError?.message || "Permission denied");
      } else {
        toast.error(error.userMessage || "Failed to update admin");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    resetForm();
    setActiveTab("personal");
    setShowCurrentPassword(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  if (!isOpen || !adminData) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="editmodal-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="background-blur" onClick={handleClose} />

        <motion.div
          className="faculty-edit-admin-container"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <button onClick={handleClose} className="x-btn">
            <X size={20} />
          </button>

          <div className="p-4 sm:p-6 pb-3 sm:pb-4">
            <h2 className="form-header text-xl md:text-2xl pr-8">Edit Admin Profile</h2>
            <p className="form-subtitle-info">
              ID: FAC-{String(adminData.id).padStart(4, "0")}
            </p>
          </div>

          <div className="tab-nav-list">
            <button
              onClick={() => setActiveTab("personal")}
              className={`tab-item ${activeTab === "personal" ? "tab-item-active" : "tab-item-inactive"}`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`tab-item ${activeTab === "password" ? "tab-item-active" : "tab-item-inactive"}`}
            >
              Change Password
            </button>
          </div>

          <form onSubmit={formik.handleSubmit} className="p-4 sm:p-6">
            {activeTab === "personal" ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="form-title sm:text-sm">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                  />
                  {touched.name && errors.name && <p className="showError text-xs">{errors.name}</p>}
                </div>

                <div>
                  <label className="form-title sm:text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select text-sm"
                  />
                  {touched.email && errors.email && <p className="showError text-xs">{errors.email}</p>}
                </div>

                <div>
                  <label className="form-title sm:text-sm">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="10"
                    className="dropdown-select text-sm"
                  />
                  {touched.phone && errors.phone && <p className="showError text-xs">{errors.phone}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-sub-text mb-3 sm:mb-4">
                  Leave blank if you don't want to change your password
                </p>

                <div className="relative">
                  <label className="form-title sm:text-sm">Current Password</label>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="current_password"
                    value={values.current_password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter current password"
                    className="dropdown-select text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-8 sm:top-9 text-sub-text"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {touched.current_password && errors.current_password && (
                    <p className="showError text-xs">{errors.current_password}</p>
                  )}
                </div>

                <div className="relative">
                  <label className="form-title sm:text-sm">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter new password"
                    className="dropdown-select text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 sm:top-9 text-sub-text"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {touched.password && errors.password && <p className="showError text-xs">{errors.password}</p>}
                </div>

                <div className="relative">
                  <label className="form-title sm:text-sm">Confirm New Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={values.password_confirmation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm new password"
                    className="dropdown-select text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 sm:top-9 text-sub-text"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {touched.password_confirmation && errors.password_confirmation && (
                    <p className="showError text-xs">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 cancel-btn text-sm order-2 sm:order-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 auth-btn flex items-center justify-center text-sm order-1 sm:order-2"
                disabled={isLoading || formik.isSubmitting}
              >
                {isLoading || formik.isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminEditModal;