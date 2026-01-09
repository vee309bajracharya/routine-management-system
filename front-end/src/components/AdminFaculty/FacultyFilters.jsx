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

  const handleClearSearch = () => {
    setLocalSearch("");
    setSearchQuery("");
  };

  return (
    <div className="flex justify-between items-center mb-4 gap-4">
      {/* Role Filter Buttons */}
      <div className="flex items-center gap-2 text-sm">
        {["all", "admin", "teacher"].map((role) => (
          <button
            key={role}
            className={`filter-btn transition-colors ${
              selectedRole === role
                ? "bg-main-blue text-white  hover:bg-hover-blue "
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-sub-text pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Department"
            value={localSearch}
            onChange={handleSearchChange}
            className="search-btn"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-sub-text hover:text-primary-text"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button
          className="btn-link"
          onClick={() => navigate("/admin/academic-structure/user-accounts")}
        >
          Add Faculty <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default FacultyFilters;