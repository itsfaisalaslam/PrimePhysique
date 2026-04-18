import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminAttendanceOverview from "./pages/AdminAttendanceOverview";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNotifications from "./pages/AdminNotifications";
import AdminTrainers from "./pages/AdminTrainers";
import AdminUsers from "./pages/AdminUsers";
import AIGenerator from "./pages/AIGenerator";
import Calendar from "./pages/Calendar";
import Chat from "./pages/Chat";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Diet from "./pages/Diet";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyAttendance from "./pages/MyAttendance";
import MyNotifications from "./pages/MyNotifications";
import MyPayments from "./pages/MyPayments";
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
  const token = localStorage.getItem("token") || localStorage.getItem("primephysique_token");
  const storedUser = localStorage.getItem("user") || localStorage.getItem("primephysique_user");
  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  return (
    <Routes>
      <Route path="/" element={<AppShell><Home /></AppShell>} />
      <Route path="/login" element={<AppShell><Login /></AppShell>} />
      <Route path="/register" element={<AppShell><Register /></AppShell>} />
      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AppShell>
              <AdminDashboard />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin-users"
        element={
          <AdminRoute>
            <AppShell>
              <AdminUsers />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin-attendance"
        element={
          <AdminRoute>
            <AppShell>
              <AdminAttendanceOverview />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin-analytics"
        element={
          <AdminRoute>
            <AppShell>
              <AdminAnalytics />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin-trainers"
        element={
          <AdminRoute>
            <AppShell>
              <AdminTrainers />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin-notifications"
        element={
          <AdminRoute>
            <AppShell>
              <AdminNotifications />
            </AppShell>
          </AdminRoute>
        }
      />
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
        path="/my-payments"
        element={
          <PrivateRoute>
            <AppShell>
              <MyPayments />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <PrivateRoute>
            <AppShell>
              <MyAttendance />
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
              <MyNotifications />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/my-notifications"
        element={
          <PrivateRoute>
            <AppShell>
              <MyNotifications />
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
        element={<Navigate to={token ? (currentUser?.isAdmin ? "/admin-dashboard" : "/dashboard") : "/"} replace />}
      />
    </Routes>
  );
}

export default App;
