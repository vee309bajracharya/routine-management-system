import React from 'react'
import Login from './pages/Login'
import AdminLogin from './pages/auth/AdminLogin'
import TeacherLogin from './pages/auth/TeacherLogin'

import {Route,Routes} from 'react-router-dom'
import Home from './pages/Home'



const App = () => {
  return (
    
    <div>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/TeacherLogin' element={<TeacherLogin />} />
        <Route path='/AdminLogin' element={<AdminLogin />} />
      </Routes>

    </div>
    
    
    
  )
}

export default App