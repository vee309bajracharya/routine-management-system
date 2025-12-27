import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/common/Loader";
import ProtectedRoute from "./pages/features/auth/ProtectedRoute";

//Public Pages
const Home = lazy(() => import("./pages/Home/Home"));
const AdminLogin = lazy(() => import("./pages/features/auth/AdminLogin"));
const TeacherLogin = lazy(() => import("./pages/features/auth/TeacherLogin"));
const PageNotFound = lazy(() => import("./components/common/PageNotFound"));

//Layouts
const AdminLayout = lazy(() => import("./layout/AdminLayout"));
const TeacherLayout = lazy(() => import("./layout/TeacherLayout"));

//Admin page
const AdminDashboard = lazy(() => import("./pages/users/admin/AdminDashboard"));
const AdminSchedulePage = lazy(() =>
  import("./pages/users/admin/AdminSchedulePage")
);
const AdminFaculty = lazy(() => import("./pages/users/admin/AdminFaculty"));
const AdminDepartment = lazy(() =>
  import("./pages/users/admin/AdminDepartment")
);
const AdminRooms = lazy(() => import("./pages/users/admin/AdminRooms"));
const AdminLabs = lazy(() => import("./pages/users/admin/AdminLabs"));
const AdminActivityLog = lazy(() => import("./pages/users/admin/AdminActivityLog"));
const AdminSettings = lazy(() => import("./pages/users/admin/AdminSettings"));
const TeacherAvaibility = lazy(() => import("./pages/users/admin/TeacherAvaibility"));

//Academic Structure sidebar imports
const AcademicStructure = lazy(() =>
  import("./components/navigation/AcademicStructure")
);
const UserAccounts = lazy(() =>
  import("./pages/users/admin/academic-structure/UserAccounts")
);
const AcademicDepartments = lazy(() =>
  import("./pages/users/admin/academic-structure/AcademicDepartments")
);
const Teachers = lazy(() =>
  import("./pages/users/admin/academic-structure/Teachers")
);
const AcademicYears = lazy(() =>
  import("./pages/users/admin/academic-structure/AcademicYears")
);
const Semesters = lazy(() =>
  import("./pages/users/admin/academic-structure/Semesters")
);
const Batches = lazy(() =>
  import("./pages/users/admin/academic-structure/Batches")
);
const Courses = lazy(() =>
  import("./pages/users/admin/academic-structure/Courses")
);
const Rooms = lazy(() =>
  import("./pages/users/admin/academic-structure/Rooms")
);
const TimeSlots = lazy(() =>
  import("./pages/users/admin/academic-structure/TimeSlots")
);
const CourseAssignments = lazy(() =>
  import("./pages/users/admin/academic-structure/CourseAssignments")
);

//Teacher Pages
const TeacherDashboard = lazy(() =>
  import("./pages/users/teacher/TeacherDashboard")
);

const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
      />
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* auth routes  */}

        {/* Teacher routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="schedule/*" element={<AdminSchedulePage />} />

          <Route path="faculty" element={<AdminFaculty />} />
          <Route path="department" element={<AdminDepartment />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="labs" element={<AdminLabs />} />
          <Route path="teacher-availability" element={<TeacherAvaibility />} />

          {/* Academic Structure nested routes */}
          <Route path="academic-structure" element={<AcademicStructure />}>
            {/* Default route for /admin/academic-structure */}
            <Route index element={<Navigate to="user-accounts" replace />} />

            {/* Foundational */}
            <Route path="user-accounts" element={<UserAccounts />} />

            {/* Curriculum */}
            <Route
              path="academic-departments"
              element={<AcademicDepartments />}
            />
            <Route path="teachers" element={<Teachers />} />
            <Route path="academic-years" element={<AcademicYears />} />
            <Route path="semesters" element={<Semesters />} />
            <Route path="batches" element={<Batches />} />
            <Route path="courses" element={<Courses />} />

            {/* Resources */}
            <Route path="rooms" element={<Rooms />} />

            {/* Scheduling */}
            <Route path="time-slots" element={<TimeSlots />} />
            <Route path="course-assignments" element={<CourseAssignments />} />
          </Route>
          <Route path="activitylog" element={<AdminActivityLog />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Teacher routes with layout */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute role="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
        </Route>

        {/* unknown routes */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
