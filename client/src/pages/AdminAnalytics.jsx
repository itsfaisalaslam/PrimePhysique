import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../services/api";

const summaryCards = [
  { key: "totalUsers", label: "Total Users" },
  { key: "activeMemberships", label: "Active Memberships" },
  { key: "expiredMemberships", label: "Expired Memberships" },
  { key: "totalRevenueCollected", label: "Revenue Collected" },
  { key: "totalPendingAmount", label: "Pending Payments" },
  { key: "todayAttendanceCount", label: "Today Attendance" }
];

const pieColors = ["#14b8a6", "#f59e0b", "#38bdf8"];
const trainerBarColor = "#38bdf8";
const revenueBarColor = "#14b8a6";

const chartContainerClass = "surface p-6";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

const exportSummaryAsCsv = (summary) => {
  const rows = [
    ["Metric", "Value"],
    ["Total Users", summary?.totalUsers ?? 0],
    ["Total Trainers", summary?.totalTrainers ?? 0],
    ["Total Admins", summary?.totalAdmins ?? 0],
    ["Active Memberships", summary?.activeMemberships ?? 0],
    ["Expired Memberships", summary?.expiredMemberships ?? 0],
    ["Expiring Soon Memberships", summary?.expiringSoonMemberships ?? 0],
    ["Revenue Collected", summary?.totalRevenueCollected ?? 0],
    ["Pending Payments", summary?.totalPendingAmount ?? 0],
    ["Paid Count", summary?.paidCount ?? 0],
    ["Unpaid Count", summary?.unpaidCount ?? 0],
    ["Partial Count", summary?.partialCount ?? 0],
    ["Total Attendance Records", summary?.totalAttendanceRecords ?? 0],
    ["Today Attendance", summary?.todayAttendanceCount ?? 0],
    ["Current Month Attendance", summary?.currentMonthAttendanceCount ?? 0]
  ];

  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "primephysique-admin-summary.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const AdminAnalytics = () => {
  const [summary, setSummary] = useState({});
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [membershipPlanBreakdown, setMembershipPlanBreakdown] = useState([]);
  const [trainerClientBreakdown, setTrainerClientBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/analytics");
        setSummary(response.data?.summary || {});
        setMonthlyRevenue(response.data?.monthlyRevenue || []);
        setMembershipPlanBreakdown(response.data?.membershipPlanBreakdown || []);
        setTrainerClientBreakdown(response.data?.trainerClientBreakdown || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load analytics overview.");
        setSummary({});
        setMonthlyRevenue([]);
        setMembershipPlanBreakdown([]);
        setTrainerClientBreakdown([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const hasMembershipData = useMemo(
    () => membershipPlanBreakdown.some((entry) => entry?.count > 0),
    [membershipPlanBreakdown]
  );

  if (loading) {
    return (
      <div className="surface mx-auto max-w-7xl p-8 text-slate-200">
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-8 text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl page-stack fade-in-up">
      <section className="surface p-8 sm:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">Admin Analytics</p>
            <h1 className="mt-5 section-title">Performance and operations overview</h1>
            <p className="mt-5 max-w-3xl section-copy">
              Track revenue, memberships, attendance, and trainer workload from one compact reporting dashboard.
            </p>
          </div>

          <button type="button" onClick={() => exportSummaryAsCsv(summary)} className="btn-secondary">
            Export Summary CSV
          </button>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.key} className="stat-card">
            <p className="eyebrow">{card.label}</p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              {card.key.includes("Revenue") || card.key.includes("Pending")
                ? formatCurrency(summary?.[card.key])
                : summary?.[card.key] ?? 0}
            </h2>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className={chartContainerClass}>
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Revenue by Month</h2>
            <p className="text-slate-300">Collected payment totals over time.</p>
          </div>

          {monthlyRevenue.length === 0 ? (
            <div className="empty-state">No revenue data available yet.</div>
          ) : (
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#081225",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16,
                      color: "#e2e8f0"
                    }}
                  />
                  <Bar dataKey="revenue" fill={revenueBarColor} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={chartContainerClass}>
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Membership Plans</h2>
            <p className="text-slate-300">Current distribution across paid plans.</p>
          </div>

          {!hasMembershipData ? (
            <div className="empty-state">No membership plan data yet.</div>
          ) : (
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#081225",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16,
                      color: "#e2e8f0"
                    }}
                  />
                  <Pie
                    data={membershipPlanBreakdown}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {membershipPlanBreakdown.map((entry, index) => (
                      <Cell key={entry?.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className={chartContainerClass}>
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Trainer-wise Clients</h2>
          <p className="text-slate-300">See how client assignments are distributed across trainers.</p>
        </div>

        {trainerClientBreakdown.length === 0 ? (
          <div className="empty-state">No trainer assignment data available yet.</div>
        ) : (
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainerClientBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="trainerName" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#081225",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    color: "#e2e8f0"
                  }}
                />
                <Bar dataKey="clientCount" fill={trainerBarColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="surface p-6">
          <p className="eyebrow">Total Trainers</p>
          <h2 className="mt-4 text-3xl font-bold text-white">{summary?.totalTrainers ?? 0}</h2>
        </article>
        <article className="surface p-6">
          <p className="eyebrow">Total Admins</p>
          <h2 className="mt-4 text-3xl font-bold text-white">{summary?.totalAdmins ?? 0}</h2>
        </article>
        <article className="surface p-6">
          <p className="eyebrow">Expiring Soon</p>
          <h2 className="mt-4 text-3xl font-bold text-white">{summary?.expiringSoonMemberships ?? 0}</h2>
        </article>
        <article className="surface p-6">
          <p className="eyebrow">This Month Attendance</p>
          <h2 className="mt-4 text-3xl font-bold text-white">{summary?.currentMonthAttendanceCount ?? 0}</h2>
        </article>
      </section>
    </div>
  );
};

export default AdminAnalytics;
