import { useEffect, useState } from "react";
import api from "../services/api";

const attendanceBadgeClass = (status) => {
  if (status === "present") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  }

  return "border-rose-500/20 bg-rose-500/10 text-rose-200";
};

const formatDisplayDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
};

const formatDisplayDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
};

const AdminAttendanceOverview = () => {
  const [summary, setSummary] = useState({
    todayAttendance: 0,
    totalPresent: 0,
    totalAbsent: 0
  });
  const [latestAttendance, setLatestAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttendanceOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/attendance-overview");
        setSummary(response.data?.summary || {});
        setLatestAttendance(response.data?.latestAttendance || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load attendance overview.");
        setSummary({
          todayAttendance: 0,
          totalPresent: 0,
          totalAbsent: 0
        });
        setLatestAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceOverview();
  }, []);

  if (loading) {
    return (
      <div className="surface mx-auto max-w-6xl p-8 text-slate-200">
        Loading attendance overview...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl page-stack fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Admin Attendance</p>
        <h1 className="mt-5 section-title">Attendance Overview</h1>
        <p className="mt-5 section-copy">
          Monitor today&apos;s check-ins and review recent gym attendance records.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        <article className="stat-card">
          <p className="eyebrow">Today&apos;s Attendance</p>
          <h2 className="mt-4 text-4xl font-bold text-white">{summary?.todayAttendance ?? 0}</h2>
        </article>

        <article className="stat-card">
          <p className="eyebrow">Total Present</p>
          <h2 className="mt-4 text-4xl font-bold text-white">{summary?.totalPresent ?? 0}</h2>
        </article>

        <article className="stat-card">
          <p className="eyebrow">Total Absent</p>
          <h2 className="mt-4 text-4xl font-bold text-white">{summary?.totalAbsent ?? 0}</h2>
        </article>
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Latest Attendance</h2>
          <p className="text-slate-300">Newest attendance entries across all members.</p>
        </div>

        {latestAttendance.length === 0 ? (
          <div className="empty-state">No attendance records found.</div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-left">
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">User Name</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Check-in Time</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {latestAttendance.map((entry) => (
                    <tr key={entry?._id} className="border-t border-white/10 bg-slate-950/75">
                      <td className="px-5 py-4 text-white">{entry?.userId?.name || "Unknown user"}</td>
                      <td className="px-5 py-4 text-slate-300">{formatDisplayDate(entry?.date)}</td>
                      <td className="px-5 py-4">
                        <span className={`pill ${attendanceBadgeClass(entry?.status)}`}>
                          {entry?.status || "present"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{formatDisplayDateTime(entry?.checkInTime)}</td>
                      <td className="px-5 py-4 text-slate-300">{entry?.notes || "-"}</td>
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

export default AdminAttendanceOverview;
