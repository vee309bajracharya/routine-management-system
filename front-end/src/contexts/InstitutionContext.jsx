/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../services/api/axiosClient";
import { toast } from "react-toastify";

const InstitutionContext = createContext();

export const InstitutionProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [institution, setInstitution] = useState(null);

  // Fetch institution details from backend
  // Memoized with useCallback to prevent unnecessary re-renders
  const fetchInstitution = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/admin/institution");
      if (response.data.success) {
        setInstitution(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch institution details:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update institution details (text and logo)
  const updateInstitution = async (formData) => {
    try {
      const response = await axiosClient.post(
        "/admin/institution/update",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.success) {
        setInstitution(response.data.data);
        toast.success("Institution details updated successfully");
        return true;
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update institution details");
    } 
    return false;
  };

  // Delete only the logo
  const deleteInstitutionLogo = async () => {
    try {
      const response = await axiosClient.delete("/admin/institution/logo");
      if (response.data.success) {
        setInstitution((prev) => ({ ...prev, logo: null }));
        toast.success("Logo deleted successfully");
      }
    } catch (error) {
      console.error("Logo deletion failed:", error);
      toast.error("Failed to delete logo");
    }
  };

  // Initial fetch on app load if token exists
  useEffect(() => {
    const token = sessionStorage.getItem("auth_token") || localStorage.getItem('auth_token');
    if (token) {
      fetchInstitution();
    }
  }, [fetchInstitution]);

  const contextValue = {
    institution,
    loading,
    fetchInstitution,
    updateInstitution,
    deleteInstitutionLogo,
  };

  return (
    <InstitutionContext.Provider value={contextValue}>
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error("useInstitution must be used within an InstitutionProvider");
  }
  return context;
};

export default InstitutionContext;