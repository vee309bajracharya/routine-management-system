import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";

// Custom debounce hook
const useDebounce = (value, delay = 450) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const FacultyFilters = ({
  selectedRole,
  setSelectedRole,
  searchQuery,
  setSearchQuery,
  roleCounts,
  navigate,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 450);

  // Update parent search query when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-4 gap-3 sm:gap-4">
      {/* Role Filter Buttons */}
      <div className="flex items-center gap-2 text-xs sm:text-sm overflow-x-auto pb-2 lg:pb-0">
        {["all", "admin", "teacher"].map((role) => (
          <button
            key={role}
            className={`filter-btn transition-colors whitespace-nowrap ${
              selectedRole === role
                ? "bg-main-blue text-white hover:bg-hover-blue"
                : "bg-gray-100 text-primary-text dark:hover:text-black hover:bg-gray-200 dark:bg-dark-hover dark:text-white"
            }`}
            onClick={() => handleRoleClick(role)}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
            <span className={`ml-1 ${selectedRole === role ? "text-white" : "text-gray-500"}`}>
              ({roleCounts[role] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Search + Add Button */}
      <div className="action-bar-container">
        <div className="relative w-full sm:w-auto">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Department"
            value={localSearch}
            onChange={handleSearchChange}
            className="search-btn"
          />
          
        </div>
        <button
          className="btn-link justify-center font-medium"
          onClick={() => navigate("/admin/academic-structure/user-accounts")}
        >
          <Plus size={16} />
          <span>Add Faculty</span>
        </button>
      </div>
    </div>
  );
};

export default FacultyFilters;