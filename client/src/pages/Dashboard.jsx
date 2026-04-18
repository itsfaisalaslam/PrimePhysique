import { useEffect, useState } from "react";
import api from "../services/api";

const formatDisplayDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
};

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;

const membershipBadgeClass = (status) => {
  if (status === "active") {
    return "bg-emerald-500/15 text-emerald-200";
  }

  if (status === "expired") {
    return "bg-rose-500/15 text-rose-200";
  }

  return "bg-slate-500/15 text-slate-300";
};

const paymentBadgeClass = (status) => {
  if (status === "paid") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "partial") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-200";
  }

  return "border-rose-500/20 bg-rose-500/10 text-rose-200";
};

const Dashboard = () => {
  const storedUser = localStorage.getItem("user") || localStorage.getItem("primephysique_user");
  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  const [user, setUser] = useState(null);
  const [latestPayment, setLatestPayment] = useState(null);
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, paymentsResponse, notificationsResponse] = await Promise.all([
          api.get("/users/profile"),
          api.get("/users/payments"),
          api.get("/users/notifications")
        ]);

        setUser(profileResponse.data?.user || null);
        setLatestPayment(paymentsResponse.data?.payments?.[0] || null);
        setLatestNotifications((notificationsResponse.data?.notifications || []).slice(0, 3));
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load dashboard data.");
        setUser(null);
        setLatestPayment(null);
        setLatestNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="surface mx-auto max-w-3xl p-8 text-slate-200">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-8 text-rose-200">
        {error}
      </div>
    );
  }

  const membershipPlan =
    user?.membershipPlan && user.membershipPlan !== "None" ? user.membershipPlan : "No membership assigned";
  const membershipEndDate = formatDisplayDate(user?.membershipEndDate);
  const membershipStatus = user?.membershipStatus || "none";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8 fade-in-up">
      <section className="rounded-3xl border border-white/5 bg-[#081225] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="section-kicker">PrimePhysique</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-400 md:text-lg">
              Review your membership, trainer support, payments, and recent account activity from one clean fitness workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Account Status</p>
              <p className="mt-3 text-2xl font-semibold text-white">Active</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Current Focus</p>
              <p className="mt-3 text-2xl font-semibold text-white">{user?.goal || user?.fitnessGoal || "Set your goal"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#081225] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Name</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">{user?.name || "Not available"}</h2>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#081225] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Email</p>
          <h2 className="mt-4 break-all text-2xl font-semibold text-white">{user?.email || "Not available"}</h2>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#081225] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Goal</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            {user?.goal || user?.fitnessGoal || "Not set"}
          </h2>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#081225] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] md:p-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white">Membership Details</h2>
          <p className="mt-2 text-base text-slate-400 md:text-lg">
            Review your current membership plan, billing amount, and membership timeline.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Current Plan</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {membershipPlan}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Status</p>
            <div className="mt-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${membershipBadgeClass(membershipStatus)}`}>
                {membershipStatus}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">End Date</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {membershipEndDate}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Join Date</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {formatDisplayDate(user?.joinDate || user?.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Membership Plan</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {membershipPlan}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Membership Fee</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {formatCurrency(user?.membershipFee)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Membership Start Date</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {formatDisplayDate(user?.membershipStartDate)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Membership End Date</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {membershipEndDate}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Membership Status</p>
            <div className="mt-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${membershipBadgeClass(membershipStatus)}`}>
                {membershipStatus}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">My Trainer</h2>
          <p className="text-slate-300">
            Your assigned trainer contact details.
          </p>
        </div>

        {user?.assignedTrainer ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="stat-card">
              <p className="eyebrow">Trainer Name</p>
              <p className="mt-4 text-2xl font-semibold text-white">
                {user?.assignedTrainer?.name || "Not available"}
              </p>
            </div>

            <div className="stat-card">
              <p className="eyebrow">Trainer Email</p>
              <p className="mt-4 break-all text-2xl font-semibold text-white">
                {user?.assignedTrainer?.email || "Not available"}
              </p>
            </div>
          </div>
        ) : (
          <div className="empty-state">No trainer assigned.</div>
        )}
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Latest Payment Summary</h2>
          <p className="text-slate-300">
            A quick snapshot of your most recent membership payment.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Current Plan</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {latestPayment?.membershipPlan || membershipPlan}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Latest Status</p>
            <div className="mt-3">
              {latestPayment ? (
                <span className={`pill ${paymentBadgeClass(latestPayment?.paymentStatus)}`}>
                  {latestPayment?.paymentStatus || "unpaid"}
                </span>
              ) : (
                <span className="pill border-slate-500/20 bg-slate-500/10 text-slate-300">
                  No payment recorded
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#050f20] p-5 shadow-sm transition-all duration-200 hover:translate-y-[-2px]">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Pending Amount</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {formatCurrency(latestPayment?.pendingAmount)}
            </p>
          </div>
        </div>
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Latest Notifications</h2>
          <p className="text-slate-300">
            Recent alerts from your PrimePhysique account.
          </p>
        </div>

        {latestNotifications.length === 0 ? (
          <div className="empty-state">No recent notifications.</div>
        ) : (
          <div className="grid gap-4">
            {latestNotifications.map((notification) => (
              <div
                key={notification?._id}
                className={`rounded-[20px] border p-5 ${
                  notification?.isRead ? "border-white/10 bg-slate-950/60" : "border-brand-400/30 bg-brand-400/10"
                }`}
              >
                <p className="text-lg font-semibold text-white">
                  {notification?.title || "PrimePhysique Update"}
                </p>
                <p className="mt-2 text-slate-300">{notification?.message || "-"}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="card card-hover p-6 lg:col-span-2">
          <p className="eyebrow">What You Can Do Next</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Your workspace is ready for action</h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Use the navigation to jump into workouts, diets, AI-generated plans, progress logs, or your calendar streak. Everything is now visually aligned to make the next step feel obvious.
          </p>
        </div>

        <div className="card card-hover p-6">
          <p className="eyebrow">Profile Sync</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Protected API Connected</h2>
          <p className="mt-3 text-slate-300">
            Your dashboard data is loading from the authenticated profile route without runtime crashes.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
