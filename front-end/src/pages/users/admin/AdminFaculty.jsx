import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../services/api/axiosClient";
import { toast } from "react-toastify";

// Components
import FacultyFilters from "../../../components/AdminFaculty/FacultyFilters";
import FacultyTable from "../../../components/AdminFaculty/FacultyTable";
import FacultyPagination from "../../../components/AdminFaculty/FacultyPagination";
import FacultyDetailsDrawer from "../../../components/AdminFaculty/FacultyDetailDrawer";
import AdminEditModal from "../../../components/AdminFaculty/AdminEditModal";
import TeacherEditModal from "../../../components/AdminFaculty/TeacherEditModal";

const AdminFaculty = () => {
  const navigate = useNavigate();

  // Data States
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [roleCounts, setRoleCounts] = useState({ all: 0, admin: 0, teacher: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Pagination States
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);
  const [isTeacherEditModalOpen, setIsTeacherEditModalOpen] = useState(false);

  // Fetch role counts
  const fetchRoleCounts = useCallback(async () => {
    try {
      let allUsers = [];
      let page = 1;
      let per_page = 15;
      let totalPages = 1;

      do {
        const res = await axiosClient.get("/admin/users", { params: { page, per_page } });
        if (res.data.success) {
          allUsers = [...allUsers, ...(res.data.data || [])];
          totalPages = res.data.pagination?.last_page || 1;
        }
        page++;
      } while (page <= totalPages);

      setRoleCounts({
        all: allUsers.length,
        admin: allUsers.filter(u => u.role === "admin").length,
        teacher: allUsers.filter(u => u.role === "teacher").length,
      });
    } catch (error) {
      console.error("Failed to fetch role counts:", error);
    }
  }, []);

  // Fetch users with filters
  const fetchUsers = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, ...filters };
      const response = await axiosClient.get("/admin/users", { params });

      if (response.data.success) {
        setUsers(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(error.userMessage || "Failed to fetch users");
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRoleCounts();
  }, [fetchRoleCounts]);

  // Fetch users whenever filters or page changes
  useEffect(() => {
    const filters = {
      search: searchQuery?.trim() || null,
      role: selectedRole !== "all" ? selectedRole : null,
    };

    fetchUsers(currentPage, filters);
  }, [currentPage, searchQuery, selectedRole, fetchUsers]);

  // Fetch single user details
  const fetchUserDetails = async (userId) => {
    try {
      const response = await axiosClient.get(`/admin/users/${userId}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to fetch user details");
      throw error;
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      const response = await axiosClient.delete(`/admin/users/${userId}`);
      
      if (response.data.success) {
        toast.success(response.data.message || "User deleted successfully");
        
        // Refresh data immediately
        await Promise.all([
          fetchUsers(currentPage, {
            search: searchQuery?.trim() || null,
            role: selectedRole !== "all" ? selectedRole : null,
          }),
          fetchRoleCounts()
        ]);
        
        return true;
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || "Cannot delete user");
      } else {
        toast.error(error.userMessage || "Failed to delete user");
      }
      throw error;
    }
  };

  // Drawer handlers
  const openDrawer = async (user) => {
    try {
      const userData = await fetchUserDetails(user.id);
      setSelectedUser(userData);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Failed to open drawer:", error);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  // Edit Modal handlers - Opens correct modal based on role
  const openEditModal = async (user) => {
    try {
      const userData = await fetchUserDetails(user.id);
      setSelectedUser(userData);
      
      // Open appropriate modal based on role
      if (userData.role === "admin") {
        setIsAdminEditModalOpen(true);
      } else if (userData.role === "teacher") {
        setIsTeacherEditModalOpen(true);
      }
      
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Failed to open edit modal:", error);
    }
  };

  const closeAdminEditModal = () => {
    setIsAdminEditModalOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  const closeTeacherEditModal = () => {
    setIsTeacherEditModalOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  // Handle successful edit
  const handleEditSuccess = async () => {
    closeAdminEditModal();
    closeTeacherEditModal();
    
    // Refresh current page data
    await Promise.all([
      fetchUsers(currentPage, {
        search: searchQuery?.trim() || null,
        role: selectedRole !== "all" ? selectedRole : null,
      }),
      fetchRoleCounts()
    ]);
  };

  // Pagination handler 
  const loadPage = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "role") {
    if (value === selectedRole) return; 
    setSelectedRole(value);
  }

  if (filterType === "search") {
    if (value === searchQuery) return; 
    setSearchQuery(value);
  }

  setCurrentPage(1);
  };

  return (
    <section className="bg-white dark:bg-dark-overlay font-general-sans relative min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h1 className="form-header">
          Faculty Administration
        </h1>
        <p className="form-subtext">
          Manage all faculty data including adding, editing, viewing profiles, and removing entries.
        </p>
      </div>

      {/* Filters */}
      <FacultyFilters
        selectedRole={selectedRole}
        setSelectedRole={(value) => handleFilterChange("role", value)}
        searchQuery={searchQuery}
        setSearchQuery={(value) => handleFilterChange("search", value)}
        roleCounts={roleCounts}
        navigate={navigate}
      />

      {/* Table */}
      <FacultyTable
        users={users}
        selectedRole={selectedRole}
        openDrawer={openDrawer}
        openEditModal={openEditModal}
        deleteUser={deleteUser}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <FacultyPagination 
          pagination={pagination} 
          loadPage={loadPage} 
        />
      )}

      {/* Drawer */}
      {isDrawerOpen && selectedUser && (
        <FacultyDetailsDrawer
          selectedUser={selectedUser}
          closeDrawer={closeDrawer}
          openEditModal={openEditModal}
        />
      )}

      {/* Admin Edit Modal */}
      {isAdminEditModalOpen && selectedUser && selectedUser.role === "admin" && (
        <AdminEditModal
          isOpen={isAdminEditModalOpen}
          onClose={closeAdminEditModal}
          adminData={selectedUser}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Teacher Edit Modal */}
      {isTeacherEditModalOpen && selectedUser && selectedUser.role === "teacher" && (
        <TeacherEditModal
          isOpen={isTeacherEditModalOpen}
          onClose={closeTeacherEditModal}
          teacherData={selectedUser}
          onSuccess={handleEditSuccess}
        />
      )}
    </section>
  );
};

export default AdminFaculty;