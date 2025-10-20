import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from './components/common/Loader';
import ProtectedRoute from './pages/features/auth/ProtectedRoute';
const Home = lazy(() => import('./pages/Home/Home'));
const AdminLogin = lazy(() => import('./pages/features/auth/AdminLogin'));
const TeacherLogin = lazy(() => import('./pages/features/auth/TeacherLogin'));
const PageNotFound = lazy(() => import('./components/common/PageNotFound'));
const AdminDashboard = lazy(() => import('./pages/users/admin/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./pages/users/teacher/TeacherDashboard'));


const App = () => {
  return (

    <Suspense fallback={<Loader />}>

      <ToastContainer position='top-right' autoClose={2000} hideProgressBar={false} />
      <Routes>

        {/* public routes */}
        <Route path='/' element={<Home />} />
        <Route path='/teacher-login' element={<TeacherLogin />} />
        <Route path='/admin-login' element={<AdminLogin />} />


        {/* auth routes  */}

        {/* Teacher routes */}
        <Route
          path='/teacher/dashboard'
          element={
            <ProtectedRoute role='teacher'>
              <TeacherDashboard />
            </ProtectedRoute>} />

        {/* Admin routes */}
        <Route
          path='/admin/dashboard'
          element={
            <ProtectedRoute role='admin'>
              <AdminDashboard />
            </ProtectedRoute>
          } />

        {/* unknown routes */}
        <Route path='*' element={<PageNotFound />} />

      </Routes>

    </Suspense>

  )
}

export default App