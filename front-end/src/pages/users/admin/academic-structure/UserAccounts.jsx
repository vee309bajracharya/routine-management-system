import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import axiosClient from "../../../../services/api/axiosClient";
import { useAuth } from "../../../../contexts/AuthContext";
import { toast } from "react-toastify";
import {
  UserAccountValidationSchema,
  UserAccountInitialValues,
} from "../../../../validations/UserAccountValidationSchema";

const UserAccounts = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const institutionId = user?.institution_id || 1;
        const res = await axiosClient.get(`/admin/dropdowns/departments/${institutionId}`);
        if (res.data.success) {
          setDepartments(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        toast.error("Failed to load departments");
      }
    };

    fetchDepartments();
  }, [user]);

  const formik = useFormik({
    initialValues: UserAccountInitialValues,
    validationSchema: UserAccountValidationSchema,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Add all non-empty values to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await axiosClient.post("/admin/users", formData);

      if (response.data.success) {
        const roleLabel = values.role === "admin" ? "Admin" : "Teacher";
        toast.success(`${roleLabel} created successfully`);
        resetForm();
        setShowPassword(false);
      }
    } catch (error) {
      console.error("Failed to create user:", error);

      // Handle Laravel validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        toast.error(firstError || "Validation failed");
      } else {
        toast.error(error.userMessage || "Failed to create user");
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }

  // Handle role change to reset role-specific fields
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    handleChange(e);
    
    // Reset teacher specific fields when switching to admin
    if (newRole === "admin") {
      setFieldValue("department_id", "");
      setFieldValue("employment_type", "");
    }
  };

  return (
    <div className="wrapper mt-6 flex justify-center font-general-sans px-4">
      <div className="w-full max-w-[720px] bg-white dark:bg-dark-overlay rounded-xl border border-box-outline p-4 sm:p-6 md:p-8">
        <h2 className="form-header">Create User Account</h2>
        <p className="form-subtext">
          Create login accounts for Admins and Teachers
        </p>

        {/* ROLE SELECTION */}
        <div className="mt-6">
          <label className="form-title">
            Role <span className="text-error-red">*</span>
          </label>
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-2">
            {["admin", "teacher"].map((role) => (
              <label key={role} className="form-radio-title">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={values.role === role}
                  onChange={handleRoleChange}
                  onBlur={handleBlur}
                  className="form-radio"
                />
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </label>
            ))}
          </div>
          {touched.role && errors.role && (
            <p className="showError">{errors.role}</p>
          )}
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FULL NAME */}
            <div>
              <label className="form-title">
                Full Name <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter Full Name"
                className="dropdown-select"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.name && errors.name && (
                <p className="showError">{errors.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="form-title">
                Email <span className="text-error-red">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email Address"
                className="dropdown-select"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.email && errors.email && (
                <p className="showError">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <label className="form-title">
                Password <span className="text-error-red">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                className="dropdown-select"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-black dark:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {touched.password && errors.password && (
                <p className="showError">{errors.password}</p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="form-title">Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter Phone Number"
                className="dropdown-select"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="10"
              />
              {touched.phone && errors.phone && (
                <p className="showError">{errors.phone}</p>
              )}
            </div>

            {/* TEACHER-SPECIFIC FIELDS */}
            {values.role === "teacher" && (
              <>
                {/* DEPARTMENT */}
                <div>
                  <label className="form-title">
                    Department <span className="text-error-red">*</span>
                  </label>
                  <select
                    name="department_id"
                    value={values.department_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="dropdown-select"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.display_label || dept.department_name}
                      </option>
                    ))}
                  </select>
                  {touched.department_id && errors.department_id && (
                    <p className="showError">{errors.department_id}</p>
                  )}
                </div>

                {/* EMPLOYMENT TYPE */}
                <div>
                  <label className="form-title">
                    Employment Type <span className="text-error-red">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3 sm:gap-6 mt-2">
                    {["Full Time", "Part Time", "Guest"].map((type) => (
                      <label key={type} className="form-radio-title">
                        <input
                          type="radio"
                          name="employment_type"
                          value={type}
                          checked={values.employment_type === type}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-radio"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                  {touched.employment_type && errors.employment_type && (
                    <p className="showError">{errors.employment_type}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                formik.resetForm();
                setShowPassword(false);
              }}
              disabled={formik.isSubmitting || isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="auth-btn flex items-center justify-center"
              disabled={formik.isSubmitting || isLoading}
            >
              {formik.isSubmitting || isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAccounts;