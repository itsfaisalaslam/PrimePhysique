import { useEffect, useState } from "react";
import api from "../services/api";

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/audit-logs");
        setAuditLogs(response.data?.auditLogs || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load audit logs.");
        setAuditLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  if (loading) {
    return (
      <div className="surface mx-auto max-w-7xl p-8 text-slate-200">
        Loading audit logs...
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
        <p className="section-kicker">Admin Audit Logs</p>
        <h1 className="mt-5 section-title">Review security-sensitive admin actions</h1>
        <p className="mt-5 section-copy">
          Track important management activity like account deletion and keep a clear history of who performed each action.
        </p>
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Audit Trail</h2>
          <p className="text-slate-300">Latest actions are shown first so you can review recent admin activity quickly.</p>
        </div>

        {auditLogs.length === 0 ? (
          <div className="empty-state">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-left">
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Action</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Target Type</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Target ID</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Performed By</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Details</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log?._id} className="border-t border-white/10 bg-slate-950/75">
                      <td className="px-5 py-4 text-white">{log?.action || "Unknown"}</td>
                      <td className="px-5 py-4 text-slate-300">{log?.targetType || "Unknown"}</td>
                      <td className="px-5 py-4 break-all text-slate-300">{log?.targetId || "Unknown"}</td>
                      <td className="px-5 py-4 text-slate-300">
                        {log?.performedBy?.name || log?.performedBy?.email || "System"}
                      </td>
                      <td className="px-5 py-4 text-slate-300">{log?.details || "No details provided."}</td>
                      <td className="px-5 py-4 text-slate-300">
                        {log?.createdAt ? new Date(log.createdAt).toLocaleString() : "Unknown"}
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

export default AdminAuditLogs;
