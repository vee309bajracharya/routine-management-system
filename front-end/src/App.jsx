import { lazy, Suspense } from 'react'
import { Route, Routes} from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from './components/common/Loader';
const Home = lazy(()=> import('./pages/Home/Home'));
const AdminLogin = lazy(()=> import('./pages/features/auth/AdminLogin'));
const TeacherLogin = lazy(()=> import('./pages/features/auth/TeacherLogin'));
const PageNotFound = lazy(()=> import('./pages/Errors/PageNotFound/PageNotFound'));


const App = () => {
  return (
    
    <Suspense fallback={<Loader/>}>
      <ToastContainer position='top-right' autoClose={2000} hideProgressBar={false}/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/teacher-login' element={<TeacherLogin />} />
        <Route path='/admin-login' element={<AdminLogin />} />

        {/* unknown routes */}
        <Route path='*' element={<PageNotFound/>}/>

      </Routes>
    </Suspense>
    
  )
}

export default App