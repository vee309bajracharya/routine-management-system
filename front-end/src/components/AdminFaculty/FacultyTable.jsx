import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const FacultyTable = ({ users, selectedRole, openDrawer, openEditModal, deleteUser, isLoading }) => {

  const handleConfirmDelete = (faculty) => {
    if (!faculty) return;

    const facultyId = String(faculty.id).padStart(4, "0");
    const facultyName = faculty.name || "Unknown";

    toast(
      ({ closeToast }) => (
        <div className="font-general-sans">
          <p className="font-semibold text-base mb-2 text-error-red">
            Delete FAC-{facultyId} {facultyName}?
          </p>
          <p className="text-xs mb-3 text-sub-text">
            Are you sure you want to permanently delete this user?
            <br />
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeToast}
              className="px-3 py-1.5 bg-gray-200 text-primary-text rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                closeToast();
                try {
                  await deleteUser(faculty.id);
                } catch (error) {
                  console.error("Delete failed:", error);
                }
              }}
              className="px-3 py-1.5 rounded-md bg-error-red hover:bg-red-700 text-white transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-faculty-${faculty.id}`,
        closeButton: false,
        hideProgressBar: true,
        autoClose: false,
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loadingstate-wrapper">
        <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
      </div>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <div className="loadingstate-wrapper">
        <div className="text-center">
          <p className="text-sub-text text-base mb-2">No faculty members found</p>
          <p className="text-sub-text text-sm">
            {selectedRole !== "all" 
              ? `No ${selectedRole}s match your current filters` 
              : "Try adjusting your search criteria"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden font-general-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-box-outline dark:bg-dark-hover">
            <tr className="text-left text-primary-text dark:text-white">
              <th className="p-3 font-semibold">Faculty ID</th>
              <th className="p-3 font-semibold">Full Name</th>
              <th className="p-3 font-semibold">Email Address</th>
              <th className="p-3 font-semibold">Phone Number</th>
              <th className="p-3 font-semibold">Role</th>
              {selectedRole !== "admin" && (
                <>
                  <th className="p-3 font-semibold">Employment Type</th>
                  <th className="p-3 font-semibold">Available Days</th>
                  <th className="p-3 font-semibold">Department</th>
                </>
              )}
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-box-outline">
            {users.map((faculty) => (
              <tr
                key={faculty.id}
                className="hover:bg-gray-50 dark:hover:bg-dark-hover dark:text-white transition-colors"
              >
                <td className="p-3 font-medium">
                  FAC-{String(faculty.id).padStart(4, "0")}
                </td>
                <td
                  className="p-3 text-main-blue cursor-pointer hover:underline"
                  onClick={() => openDrawer(faculty)}
                >
                  {faculty.name || "N/A"}
                </td>
                <td className="p-3">{faculty.email || "N/A"}</td>
                <td className="p-3">{faculty.phone || "N/A"}</td>
                <td className="p-3 capitalize">{faculty.role || "N/A"}</td>
                {selectedRole !== "admin" && (
                  <>
                    <td className="p-3">{faculty.employment_type || "N/A"}</td>
                    <td className="p-3">{faculty.available_days || "Not Set"}</td>
                    <td className="p-3">
                      {faculty.department?.code || "N/A"}
                    </td>
                  </>
                )}
                <td className="p-3">
                  <div className="flex justify-center gap-1">
                    <button
                      className="action-eye-btn"
                      onClick={() => openDrawer(faculty)}
                      aria-label="View details"
                    >
                      <Eye size={16} className="text-primary-text dark:text-white" />
                    </button>
                    <button
                      className="action-edit-btn"
                      onClick={() => openEditModal(faculty)}
                      aria-label="Edit faculty"
                    >
                      <Pencil size={16} className="text-primary-text dark:text-white" />
                    </button>
                    <button
                      className="action-delete-btn"
                      onClick={() => handleConfirmDelete(faculty)}
                      aria-label="Delete faculty"
                    >
                      <Trash2 size={16} className="text-primary-text dark:text-white" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyTable;