import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
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
            Are you sure to delete this user permanently?
            <br />
            This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeToast}
              className="toast-cancel"
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
              className="toast-delete"
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
      <div className="loadingstate-wrapper min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-main-blue mb-3" />
      </div>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <div className="state-container">
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
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden font-general-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-thead">
              <tr className="text-left text-primary-text dark:text-white">
                <th className="table-th">Faculty ID</th>
                <th className="table-th">Full Name</th>
                <th className="table-th">Email Address</th>
                <th className="table-th">Phone Number</th>
                <th className="table-th">Role</th>
                {selectedRole !== "admin" && (
                  <>
                    <th className="table-th">Employment Type</th>
                    <th className="table-th">Available Days</th>
                    <th className="table-th">Department</th>
                  </>
                )}
                <th className="table-th">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-box-outline">
              {users.map((faculty) => (
                <tr key={faculty.id} className="table-tbody-tr">
                  <td className="p-3 align-middle">FAC-{String(faculty.id).padStart(4, "0")}</td>
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
                    <div className="flex items-center gap-2">
                      <button
                        className="action-eye-btn"
                        onClick={() => openDrawer(faculty)}
                        aria-label="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-edit-btn"
                        onClick={() => openEditModal(faculty)}
                        aria-label="Edit faculty"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-delete-btn"
                        onClick={() => handleConfirmDelete(faculty)}
                        aria-label="Delete faculty"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-card-list">
        {users.map((faculty) => (
          <div
            key={faculty.id}
            className="mobile-card-container"
          >
            {/* Header Row */}
            <div className="mobile-header">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="mobile-card-badge">
                    FAC-{String(faculty.id).padStart(4, "0")}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-dark-hover text-primary-text dark:text-white px-2 py-1 rounded capitalize">
                    {faculty.role || "N/A"}
                  </span>
                </div>
                <h3
                  className="text-base font-semibold text-primary-text dark:text-white cursor-pointer hover:text-main-blue"
                  onClick={() => openDrawer(faculty)}
                >
                  {faculty.name || "N/A"}
                </h3>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-2 border-t border-box-outline">
              <div>
                <p className="info-label">Email</p>
                <p className="text-sm font-medium text-primary-text dark:text-white break-all">
                  {faculty.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="info-label">Phone</p>
                <p className="text-sm font-medium text-primary-text dark:text-white">
                  {faculty.phone || "N/A"}
                </p>
              </div>
            </div>

            {/* Teacher-specific info */}
            {selectedRole !== "admin" && faculty.role === "teacher" && (
              <div className="space-y-2 pt-2 border-t border-box-outline">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="info-label">Employment Type</p>
                    <p className="text-sm font-medium text-primary-text dark:text-white">
                      {faculty.employment_type || "N/A"}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="info-label">Department</p>
                    <p className="text-sm font-medium text-main-blue">
                      {faculty.department?.code || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="info-label">Available Days</p>
                  <p className="text-sm font-medium text-primary-text dark:text-white">
                    {faculty.available_days || "Not Set"}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                className="btn-mobile-secondary"
                onClick={() => openDrawer(faculty)}
              >
                <Eye size={16} /> View
              </button>
              <button
                className="btn-mobile-secondary"
                onClick={() => openEditModal(faculty)}
              >
                <Edit size={16} /> Edit
              </button>
              <button
                className="delete-mobile-btn"
                onClick={() => handleConfirmDelete(faculty)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FacultyTable;