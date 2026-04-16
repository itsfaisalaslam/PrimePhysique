import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AIGenerator from "./pages/AIGenerator";
import Calendar from "./pages/Calendar";
import Chat from "./pages/Chat";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Diet from "./pages/Diet";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Progress from "./pages/Progress";
import Register from "./pages/Register";
import Workouts from "./pages/Workouts";

const AppShell = ({ children }) => (
  <div className="min-h-screen">
    <Navbar />
    <main className="app-shell">{children}</main>
    <Footer />
    <Chatbot />
  </div>
);

function App() {
  const token = localStorage.getItem("primephysique_token");

  return (
    <Routes>
      <Route path="/" element={<AppShell><Home /></AppShell>} />
      <Route path="/login" element={<AppShell><Login /></AppShell>} />
      <Route path="/register" element={<AppShell><Register /></AppShell>} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/workouts"
        element={
          <PrivateRoute>
            <AppShell>
              <Workouts />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/diets"
        element={
          <PrivateRoute>
            <AppShell>
              <Diet />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <PrivateRoute>
            <AppShell>
              <Progress />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/ai-generator"
        element={
          <PrivateRoute>
            <AppShell>
              <AIGenerator />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <AppShell>
              <Notifications />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <AppShell>
              <Calendar />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <AppShell>
              <Chat />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={token ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}

export default App;
