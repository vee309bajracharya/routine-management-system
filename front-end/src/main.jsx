import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { RoutineProvider } from "./contexts/RoutineContext.jsx";
import { RoutineEntryProvider } from "./contexts/RoutineEntryContext.jsx";
import { InstitutionProvider } from "./contexts/InstitutionContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <InstitutionProvider>
            <RoutineProvider>
              <RoutineEntryProvider>
                <ThemeProvider>
                  <App />
                </ThemeProvider>
              </RoutineEntryProvider>
            </RoutineProvider>
          </InstitutionProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
