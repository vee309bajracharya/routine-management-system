/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import axiosClient from "../../../services/api/axiosClient";
import { useAuth } from "../../../contexts/AuthContext";
import {
  TeacherProfileValidationSchema,
  TeacherProfileInitialValues,
} from "../../../validations/TeacherProfileValidationSchema";

const TeacherSetting = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [teacherData, setTeacherData] = useState(null);

  // Get updateUser from AuthContext
  const { updateUser } = useAuth();

  // Fetch teacher profile data on mount
  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      setIsFetchingProfile(true);
      const response = await axiosClient.get("/teacher/profile");

      if (response.data.success) {
        const profileData = response.data.data;
        setTeacherData(profileData);

        // Update AuthContext with the latest user data
        updateUser(profileData);
        
        // Update formik values with fetched data
        formik.setValues({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error(error.userMessage || "Failed to fetch profile data");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const formik = useFormik({
    initialValues: TeacherProfileInitialValues,
    validationSchema: TeacherProfileValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur, resetForm } = formik;

  async function handleSubmit(values) {
    setIsLoading(true);
    try {
      // Normalize values to avoid sending empty strings
      const cleanValues = {
        ...values,
        phone: values.phone === "" ? null : values.phone,
        current_password: values.current_password === "" ? null : values.current_password,
        password: values.password === "" ? null : values.password,
        password_confirmation:
          values.password_confirmation === "" ? null : values.password_confirmation,
      };

      const updateData = {};

      // Check personal info changes
      const hasPersonalInfoChanges =
        cleanValues.name !== teacherData?.name ||
        cleanValues.email !== teacherData?.email ||
        cleanValues.phone !== teacherData?.phone;

      if (hasPersonalInfoChanges) {
        if (cleanValues.name !== teacherData?.name) updateData.name = cleanValues.name;
        if (cleanValues.email !== teacherData?.email) updateData.email = cleanValues.email;
        if (cleanValues.phone !== teacherData?.phone) updateData.phone = cleanValues.phone;
      }

      // Check password changes
      const hasPasswordChange = cleanValues.password && cleanValues.password.length > 0;

      if (hasPasswordChange) {
        updateData.current_password = cleanValues.current_password;
        updateData.password = cleanValues.password;
        updateData.password_confirmation = cleanValues.password_confirmation;
      }

      // No changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        setIsLoading(false);
        return;
      }

      const response = await axiosClient.put("/teacher/update-profile", updateData);

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

        // If password changed handle logout and redirect
        if (response.data.require_login) {
          toast.warning("Please login again with your new password", { autoClose: 3000 });
          
          // Clear auth data
          sessionStorage.clear();
          localStorage.clear();
          
          setTimeout(() => {
            window.location.href = "/teacher-login";
          }, 3000);
          return;
        }

        // Refresh profile data
        await fetchTeacherProfile();
        
        // Reset password fields only
        formik.setFieldValue("current_password", "");
        formik.setFieldValue("password", "");
        formik.setFieldValue("password_confirmation", "");
        
        // Switch to personal tab
        setActiveTab("personal");
      }
    } catch (error) {
      console.error("Update failed:", error);

      const apiError = error.response?.data;

      if (error.response?.status === 422) {
        // Validation error
        if (apiError.errors && typeof apiError.errors === "object") {
          const firstError = Object.values(apiError.errors)[0][0];
          toast.error(firstError);
        } else if (apiError.error && typeof apiError.error === "object") {
          const firstError = Object.values(apiError.error)[0][0];
          toast.error(firstError);
        } else {
          toast.error(apiError.message || "Validation failed");
        }
      } else if (error.response?.status === 429) {
        toast.error(apiError?.message || "Too many attempts. Please try again later.");
      } else if (error.response?.status === 403) {
        toast.error(apiError?.message || "Permission denied");
      } else {
        toast.error(error.userMessage || "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetchingProfile) {
    return (
      <div className="mt-6 flex justify-center items-center h-[500px] font-general-sans">
        <Loader2 className="animate-spin text-main-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="mt-6 flex justify-center font-general-sans px-4">
      <div className="bg-white dark:bg-dark-overlay w-full max-w-[550px] rounded-xl border border-box-outline p-4 sm:p-6 md:p-8">
        {/* Header */}
        <h2 className="form-header mb-2">Edit Teacher Profile</h2>
        <p className="form-subtext mb-4">Update your personal information</p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 sm:gap-6 mb-2 border-b border-box-outline">
          {["personal", "password"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "text-main-blue border-b-2 border-main-blue"
                  : "text-sub-text hover:text-primary-text dark:hover:text-white"
              }`}
            >
              {tab === "personal" ? "Personal Information" : "Change Password"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {activeTab === "personal" ? (
            <>
              <div>
                <label className="form-title">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className="dropdown-select"
                />
                {touched.name && errors.name && (
                  <p className="showError">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="form-title">Email</label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className="dropdown-select"
                />
                {touched.email && errors.email && (
                  <p className="showError">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="form-title">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter 10-digit phone number"
                  className="dropdown-select"
                  maxLength="10"
                />
                {touched.phone && errors.phone && (
                  <p className="showError">{errors.phone}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="form-subtext mb-4">
                Leave blank if you don't want to change password
              </div>
              <div className="space-y-4">
                {/* Current Password */}
                <div className="relative">
                  <label className="form-title">Current Password</label>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="current_password"
                    value={values.current_password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter current password"
                    className="dropdown-select"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-sub-text"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  {touched.current_password && errors.current_password && (
                    <p className="showError">{errors.current_password}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="relative">
                  <label className="form-title">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter new password"
                    className="dropdown-select"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-sub-text"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {touched.password && errors.password && (
                    <p className="showError">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="form-title">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={values.password_confirmation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm new password"
                    className="dropdown-select"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-sub-text"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  {touched.password_confirmation && errors.password_confirmation && (
                    <p className="showError">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <button
            type="submit"
            className="auth-btn flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || formik.isSubmitting}
          >
            {isLoading || formik.isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherSetting;