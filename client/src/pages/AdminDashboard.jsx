import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statCards = [
  { key: "totalUsers", label: "Total Users" },
  { key: "totalWorkouts", label: "Total Workouts" },
  { key: "totalDiets", label: "Total Diet Plans" },
  { key: "totalProgressLogs", label: "Total Progress Logs" }
];

const AdminDashboard = () => {
  const storedUser = localStorage.getItem("user") || localStorage.getItem("primephysique_user");
  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkouts: 0,
    totalDiets: 0,
    totalProgressLogs: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard");
        setStats(response.data?.stats || {});
        setRecentUsers(response.data?.recentUsers || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load admin dashboard.");
        setStats({
          totalUsers: 0,
          totalWorkouts: 0,
          totalDiets: 0,
          totalProgressLogs: 0
        });
        setRecentUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="surface mx-auto max-w-6xl p-8 text-slate-200">
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-8 text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="page-shell fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Admin Dashboard</p>
        <h1 className="mt-5 section-title">Platform overview at a glance</h1>
        <p className="mt-5 section-copy">
          Review the current user base, monitor content volume, and keep an eye on the latest signups from one clean control panel.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="surface-muted p-4">
            <p className="eyebrow">Logged In User</p>
            <p className="mt-3 text-lg font-semibold text-white">{currentUser?.name || "Unknown"}</p>
          </div>
          <div className="surface-muted p-4">
            <p className="eyebrow">Email</p>
            <p className="mt-3 break-all text-lg font-semibold text-white">{currentUser?.email || "Unknown"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.key} className="stat-card">
            <p className="eyebrow">{card.label}</p>
            <h2 className="mt-4 text-4xl font-bold text-white">
              {stats?.[card.key] ?? 0}
            </h2>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="card card-hover p-8">
          <p className="eyebrow">User Management</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Review, search, and manage accounts</h2>
          <p className="mt-3 text-slate-300">
            Open the users management page to search the full user list, inspect roles, and delete non-admin accounts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/admin-users" className="btn-primary">
              Manage Users
            </Link>
            <Link to="/admin-analytics" className="btn-secondary">
              Analytics
            </Link>
          </div>
        </div>

        <div className="card p-8">
          <p className="eyebrow">Quick Summary</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Admin controls are ready</h2>
          <p className="mt-3 text-slate-300">
            From here you can monitor platform totals, review the newest signups, and jump into deeper administration tools without leaving the dashboard.
          </p>
          <div className="mt-6">
            <div className="flex flex-wrap gap-3">
              <Link to="/admin-attendance" className="btn-secondary">
                Attendance Overview
              </Link>
              <Link to="/admin-trainers" className="btn-secondary">
                Trainers
              </Link>
              <Link to="/admin-notifications" className="btn-secondary">
                Alerts
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Recent Users</h2>
          <p className="text-slate-300">The five most recent users in the database.</p>
        </div>

        {recentUsers.length === 0 ? (
          <div className="empty-state">No users found in the database yet.</div>
        ) : (
          <div className="table-shell">
            <div className="table-scroll">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Role</th>
                    <th className="table-header-cell">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user?._id} className="table-row">
                      <td className="table-cell text-white">{user?.name || "Unknown user"}</td>
                      <td className="table-cell">{user?.email || "No email"}</td>
                      <td className="table-cell">
                        <span className={`status-badge ${user?.isAdmin ? "status-warning" : "status-info"}`}>
                          {user?.isAdmin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="table-cell">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
