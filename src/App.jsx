// Root app component with routing
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppProvider, useApp } from "./context/AppContext";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";
import { PrefsProvider } from "./context/PrefsContext";

import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import IncidentDetail from "./pages/IncidentDetail";
import Clusters from "./pages/Clusters";
import Squads from "./pages/Squads";
import Responders from "./pages/Responders";
import SyncSessions from "./pages/SyncSessions";
// Satellite page — disabled for now, can be re-enabled later.
// import Satellite from "./pages/Satellite";
import Analytics from "./pages/Analytics";
import AccessRequests from "./pages/AccessRequests";
import AuditTrail from "./pages/AuditTrail";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

function RequireAuth({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user } = useApp();
  if (user) return <Navigate to="/" replace />;
  return children;
}

function RequireCommander({ children }) {
  const { isCommander } = useApp();
  if (!isCommander) return <Navigate to="/" replace />;
  return children;
}


export default function App() {
  return (
    <AppProvider>
      <DataProvider>
        <PrefsProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
                <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/incidents" element={<Incidents />} />
                  <Route path="/incidents/:id" element={<IncidentDetail />} />
                  <Route path="/clusters" element={<Clusters />} />
                  <Route path="/squads" element={<Squads />} />
                  <Route path="/responders" element={<Responders />} />
                  <Route path="/sync" element={<SyncSessions />} />
                  {/* <Route path="/satellite" element={<Satellite />} /> */}
                  <Route path="/analytics" element={<Analytics />} />

                  <Route path="/access" element={<RequireCommander><AccessRequests /></RequireCommander>} />
                  <Route path="/audit" element={<RequireCommander><AuditTrail /></RequireCommander>} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </PrefsProvider>
      </DataProvider>
    </AppProvider>
  );
}
