import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { RoutineProvider } from './contexts/RoutineContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RoutineProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </RoutineProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
