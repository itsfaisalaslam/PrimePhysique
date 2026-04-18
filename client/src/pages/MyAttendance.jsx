import { useEffect, useState } from "react";
import api from "../services/api";

const attendanceBadgeClass = (status) => {
  if (status === "present") {
    return "status-success";
  }

  return "status-danger";
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

const MyAttendance = () => {
  const [summary, setSummary] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    lastCheckIn: null,
    currentMonthAttendanceCount: 0
  });
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const [historyResponse, summaryResponse] = await Promise.all([
          api.get("/users/attendance"),
          api.get("/users/attendance-summary")
        ]);

        setAttendance(historyResponse.data?.attendance || []);
        setSummary(summaryResponse.data?.summary || {});
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load attendance.");
        setAttendance([]);
        setSummary({
          totalPresent: 0,
          totalAbsent: 0,
          lastCheckIn: null,
          currentMonthAttendanceCount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  if (loading) {
    return (
      <div className="surface mx-auto max-w-5xl p-8 text-slate-200">
        Loading attendance...
      </div>
    );
  }

  return (
    <div className="page-shell fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Gym Attendance</p>
        <h1 className="mt-5 section-title">My Attendance</h1>
        <p className="mt-5 section-copy">
          Review your gym check-ins, absences, and monthly attendance progress.
        </p>
      </section>

      {error && (
        <div className="alert-error">{error}</div>
      )}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="stat-card">
          <p className="eyebrow">Total Present</p>
          <h2 className="mt-4 text-4xl font-bold text-white">{summary?.totalPresent ?? 0}</h2>
        </article>

        <article className="stat-card">
          <p className="eyebrow">Total Absent</p>
          <h2 className="mt-4 text-4xl font-bold text-white">{summary?.totalAbsent ?? 0}</h2>
        </article>

        <article className="stat-card">
          <p className="eyebrow">Last Check-in</p>
          <h2 className="mt-4 text-2xl font-bold text-white">
            {formatDisplayDateTime(summary?.lastCheckIn?.checkInTime)}
          </h2>
        </article>

        <article className="stat-card">
          <p className="eyebrow">This Month Attendance</p>
          <h2 className="mt-4 text-4xl font-bold text-white">{summary?.currentMonthAttendanceCount ?? 0}</h2>
        </article>
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Attendance History</h2>
          <p className="text-slate-300">Your latest attendance records appear first.</p>
        </div>

        {attendance.length === 0 ? (
          <div className="empty-state">No attendance records yet.</div>
        ) : (
          <div className="table-shell">
            <div className="table-scroll">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Check-in Time</th>
                    <th className="table-header-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((entry) => (
                    <tr key={entry?._id} className="table-row">
                      <td className="table-cell text-white">{formatDisplayDate(entry?.date)}</td>
                      <td className="table-cell">
                        <span className={`status-badge ${attendanceBadgeClass(entry?.status)}`}>
                          {entry?.status || "present"}
                        </span>
                      </td>
                      <td className="table-cell">{formatDisplayDateTime(entry?.checkInTime)}</td>
                      <td className="table-cell">{entry?.notes || "-"}</td>
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

export default MyAttendance;
