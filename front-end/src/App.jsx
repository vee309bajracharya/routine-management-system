import { lazy, Suspense } from 'react'
import { Route, Routes} from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from './components/common/Loader';
const Home = lazy(()=> import('./pages/Home/Home'));
const AdminLogin = lazy(()=> import('./pages/features/auth/AdminLogin'));
const TeacherLogin = lazy(()=> import('./pages/features/auth/TeacherLogin'));
const PageNotFound = lazy(()=> import('./pages/Errors/PageNotFound/PageNotFound'));
const AdminDashboard = lazy(()=> import('./pages/users/admin/AdminDashboard'));
const TeacherDashboard = lazy(()=> import('./pages/users/teacher/TeacherDashboard'));


const App = () => {
  return (
    
    <Suspense fallback={<Loader/>}>
      <ToastContainer position='top-right' autoClose={2000} hideProgressBar={false}/>
      <Routes>

        {/* public routes */}
        <Route path='/' element={<Home/>} />
        <Route path='/teacher-login' element={<TeacherLogin />} />
        <Route path='/admin-login' element={<AdminLogin />} />

        {/* auth routes  */}
        <Route path='/teacher/dashboard' element={<TeacherDashboard/>}/>
        <Route path='/admin/dashboard' element={<AdminDashboard/>}/>

        {/* unknown routes */}
        <Route path='*' element={<PageNotFound/>}/>

      </Routes>
    </Suspense>
    
  )
}

export default App