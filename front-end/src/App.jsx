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
const PublicRoutineView = lazy(() => import("./pages/features/public-routine-view/PublicRoutineView"));

//Layouts
const AdminLayout = lazy(() => import("./layout/AdminLayout"));
const TeacherLayout = lazy(() => import("./layout/TeacherLayout"));

//Admin page
const AdminDashboard = lazy(() => import("./pages/users/admin/AdminDashboard"));
const AdminSchedulePage = lazy(
  () => import("./pages/users/admin/AdminSchedulePage"),
);
const AdminFaculty = lazy(() => import("./pages/users/admin/AdminFaculty"));
const AdminRooms = lazy(() => import("./pages/users/admin/AdminRooms"));
const AdminActivityLog = lazy(
  () => import("./pages/users/admin/AdminActivityLog"),
);
const AdminSettings = lazy(() => import("./pages/users/admin/AdminSettings"));


//Academic Structure sidebar
const AcademicStructure = lazy(
  () => import("./components/navigation/AcademicStructure"),
);
const UserAccounts = lazy(
  () => import("./pages/users/admin/academic-structure/UserAccounts"),
);
const AcademicDepartments = lazy(
  () => import("./pages/users/admin/academic-structure/AcademicDepartments"),
);
const AcademicYears = lazy(
  () => import("./pages/users/admin/academic-structure/AcademicYears"),
);
const Semesters = lazy(
  () => import("./pages/users/admin/academic-structure/Semesters"),
);
const Batches = lazy(
  () => import("./pages/users/admin/academic-structure/Batches"),
);
const Courses = lazy(
  () => import("./pages/users/admin/academic-structure/Courses"),
);
const Rooms = lazy(
  () => import("./pages/users/admin/academic-structure/Rooms"),
);
const TimeSlots = lazy(
  () => import("./pages/users/admin/academic-structure/TimeSlots"),
);
const CourseAssignments = lazy(
  () => import("./pages/users/admin/academic-structure/CourseAssignments"),
);
const TeacherAvaibility = lazy(
  () => import("./pages/users/admin/academic-structure/TeacherAvaibility"),
);

//Academic Details Dropdown
const DepartmentList = lazy(
  () => import("./pages/users/admin/academic-details/DepartmentList"),
);
const AcademicYearsList = lazy(
  () => import("./pages/users/admin/academic-details/AcademicYearsList"),
);
const SemesterList = lazy(
  () => import("./pages/users/admin/academic-details/SemesterList"),
);
const BatchList = lazy(
  () => import("./pages/users/admin/academic-details/BatchList"),
);
const CourseList = lazy(
  () => import("./pages/users/admin/academic-details/CourseList"),
);
const TimeSlotList = lazy(
  () => import("./pages/users/admin/academic-details/TimeSlotList"),
);
const CourseAssignmentList = lazy(
  () => import("./pages/users/admin/academic-details/CourseAssignmentList"),
);
const TeacherAvailabilityList = lazy(
  () => import("./pages/users/admin/academic-details/TeacherAvailabilityList"),
);

//Teacher Pages
const TeacherDashboard = lazy(
  () => import("./pages/users/teacher/TeacherDashboard"),
);
const TeacherSchedule = lazy(
  () => import("./pages/users/teacher/TeacherSchedule"),
);
const TeacherSetting = lazy(
  () => import("./pages/users/teacher/TeacherSetting"),
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
        <Route path="/routine/view" element={<PublicRoutineView />} />

        {/* auth routes  */}

        {/* Teacher routes */}

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

          <Route path="rooms" element={<AdminRooms />} />
          <Route path="teacher-availability" element={<TeacherAvaibility />} />

          {/* Academic Details Section */}
          <Route path="academic-details">
            {/* When the dropdown is clicked, it defaults to the Department List */}
            <Route index element={<Navigate to="department" replace />} />

            <Route path="department" element={<DepartmentList />} />
            <Route path="academic-year" element={<AcademicYearsList />} />
            <Route path="semester" element={<SemesterList />} />
            <Route path="batch" element={<BatchList />} />
            <Route path="course" element={<CourseList />} />
            <Route path="time-slot" element={<TimeSlotList />} />
            <Route
              path="course-assignment"
              element={<CourseAssignmentList />}
            />
            <Route
              path="teacher-availability"
              element={<TeacherAvailabilityList />}
            />
          </Route>

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
            <Route path="academic-years" element={<AcademicYears />} />
            <Route path="semesters" element={<Semesters />} />
            <Route path="batches" element={<Batches />} />
            <Route path="courses" element={<Courses />} />

            {/* Resources */}
            <Route path="rooms" element={<Rooms />} />

            {/* Scheduling */}
            <Route path="time-slots" element={<TimeSlots />} />
            <Route path="course-assignments" element={<CourseAssignments />} />
            <Route
              path="teacher-availability"
              element={<TeacherAvaibility />}
            />
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
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="settings" element={<TeacherSetting />} />
        </Route>

        {/* unknown routes */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
