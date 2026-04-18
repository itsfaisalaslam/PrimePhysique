import { useEffect, useState } from "react";
import api from "../services/api";

const summaryCards = [
  { key: "activeMembers", label: "Active Members", accent: "text-emerald-200" },
  { key: "expiredMembers", label: "Expired Members", accent: "text-rose-200" },
  { key: "expiringSoon", label: "Expiring Soon", accent: "text-orange-200" }
];

const formatDisplayDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
};

const getDaysLeftLabel = (value) => {
  if (!value) {
    return "-";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(value);
  targetDate.setHours(0, 0, 0, 0);

  const diffInMs = targetDate.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return "Expired";
  }

  if (diffInDays === 0) {
    return "Today";
  }

  return `${diffInDays} day${diffInDays === 1 ? "" : "s"}`;
};

const statusBadgeClass = (status) => {
  if (status === "active") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "expired") {
    return "border-rose-500/20 bg-rose-500/10 text-rose-200";
  }

  return "border-orange-400/20 bg-orange-500/10 text-orange-200";
};

const AdminMembershipOverview = () => {
  const [summary, setSummary] = useState({
    activeMembers: 0,
    expiredMembers: 0,
    expiringSoon: 0
  });
  const [expiredUsers, setExpiredUsers] = useState([]);
  const [expiringSoonUsers, setExpiringSoonUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOverview = async () => {
    const response = await api.get("/admin/membership-overview");
    setSummary(response.data?.summary || {});
    setExpiredUsers(response.data?.expiredUsers || []);
    setExpiringSoonUsers(response.data?.expiringSoonUsers || []);
  };

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError("");
        await loadOverview();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load membership overview.");
        setSummary({
          activeMembers: 0,
          expiredMembers: 0,
          expiringSoon: 0
        });
        setExpiredUsers([]);
        setExpiringSoonUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const handleRefreshStatuses = async () => {
    try {
      setRefreshing(true);
      setError("");
      setMessage("");

      const response = await api.put("/admin/users/update-expiry-status");
      setMessage(response.data?.message || "Membership statuses updated.");
      await loadOverview();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to refresh membership statuses.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="surface mx-auto max-w-7xl p-8 text-slate-200">
        Loading membership overview...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl page-stack fade-in-up">
      <section className="surface p-8 sm:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Membership Overview</p>
            <h1 className="mt-5 section-title">Monitor active, expired, and expiring memberships</h1>
            <p className="mt-5 section-copy">
              Keep an eye on renewal risk, spot expired memberships quickly, and refresh status data whenever needed.
            </p>
          </div>

          <button type="button" onClick={handleRefreshStatuses} className="btn-primary" disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Update Expiry Status"}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-[28px] border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-200">
          {message}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.key} className="stat-card">
            <p className="eyebrow">{card.label}</p>
            <h2 className={`mt-4 text-4xl font-bold ${card.accent}`}>
              {summary?.[card.key] ?? 0}
            </h2>
          </article>
        ))}
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Expiring Soon</h2>
          <p className="text-slate-300">Members whose plans expire within the next 7 days.</p>
        </div>

        {expiringSoonUsers.length === 0 ? (
          <div className="empty-state">No memberships are expiring soon.</div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-left">
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Name</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Email</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Plan</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">End Date</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringSoonUsers.map((user) => (
                    <tr key={user?._id} className="border-t border-white/10 bg-slate-950/75">
                      <td className="px-5 py-4 text-white">{user?.name || "Unknown user"}</td>
                      <td className="px-5 py-4 text-slate-300">{user?.email || "No email"}</td>
                      <td className="px-5 py-4 text-slate-300">{user?.membershipPlan || "None"}</td>
                      <td className="px-5 py-4 text-slate-300">{formatDisplayDate(user?.membershipEndDate)}</td>
                      <td className="px-5 py-4">
                        <span className="pill border-orange-400/20 bg-orange-500/10 text-orange-200">
                          {getDaysLeftLabel(user?.membershipEndDate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Expired Members</h2>
          <p className="text-slate-300">Members whose plans have already expired.</p>
        </div>

        {expiredUsers.length === 0 ? (
          <div className="empty-state">No expired memberships found.</div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 text-left">
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Name</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Email</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Plan</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">End Date</th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredUsers.map((user) => (
                    <tr key={user?._id} className="border-t border-white/10 bg-slate-950/75">
                      <td className="px-5 py-4 text-white">{user?.name || "Unknown user"}</td>
                      <td className="px-5 py-4 text-slate-300">{user?.email || "No email"}</td>
                      <td className="px-5 py-4 text-slate-300">{user?.membershipPlan || "None"}</td>
                      <td className="px-5 py-4 text-slate-300">{formatDisplayDate(user?.membershipEndDate)}</td>
                      <td className="px-5 py-4">
                        <span className={`pill ${statusBadgeClass("expired")}`}>
                          {user?.membershipStatus || "expired"}
                        </span>
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

export default AdminMembershipOverview;
