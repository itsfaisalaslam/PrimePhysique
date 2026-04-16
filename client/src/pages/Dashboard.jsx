import { useEffect, useState } from "react";
import api from "../services/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/profile");
        setUser(response.data?.user || null);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load dashboard data.");
        setUser(null);
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

  return (
    <div className="mx-auto max-w-6xl page-stack fade-in-up">
      <section className="surface overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="section-kicker">PrimePhysique</p>
            <h1 className="mt-5 section-title">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="mt-5 section-copy">
              Your account is connected and ready. Track your progress, review your plans, and keep your fitness momentum moving forward.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="surface-muted p-5">
              <p className="eyebrow">Account Status</p>
              <p className="mt-3 text-2xl font-bold text-white">Active</p>
            </div>
            <div className="rounded-[26px] border border-orange-400/20 bg-orange-500/10 p-5">
              <p className="eyebrow text-orange-200">Current Focus</p>
              <p className="mt-3 text-xl font-bold text-white">{user?.goal || user?.fitnessGoal || "Set your goal"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="stat-card">
          <p className="eyebrow">Name</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">{user?.name || "Not available"}</h2>
        </div>

        <div className="stat-card">
          <p className="eyebrow">Email</p>
          <h2 className="mt-4 break-all text-2xl font-semibold text-white">{user?.email || "Not available"}</h2>
        </div>

        <div className="stat-card">
          <p className="eyebrow">Goal</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            {user?.goal || user?.fitnessGoal || "Not set"}
          </h2>
        </div>
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
