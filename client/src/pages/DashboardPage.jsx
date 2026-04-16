import { useEffect, useState } from "react";
import api from "../api/api";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/profile");
        console.log("Dashboard profile response:", response.data);
        setUser(response.data?.user || null);
      } catch (requestError) {
        console.error("Dashboard profile error:", requestError);
        setError(requestError.response?.data?.message || "Failed to load dashboard.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 text-slate-200">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Welcome, {user?.name || "User"}
        </h1>
        <p className="mt-3 text-slate-400">
          Your profile details are loaded from the protected API route.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <p className="text-sm text-slate-400">Name</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{user?.name || "Not available"}</h2>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <p className="text-sm text-slate-400">Email</p>
          <h2 className="mt-3 break-all text-2xl font-semibold text-white">{user?.email || "Not available"}</h2>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <p className="text-sm text-slate-400">Goal</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {user?.goal || user?.fitnessGoal || "Not set"}
          </h2>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
        <h3 className="text-xl font-semibold text-white">Profile Summary</h3>
        <div className="mt-4 space-y-3 text-slate-300">
          <p>Age: {user?.age ?? "Not available"}</p>
          <p>Height: {user?.height ?? "Not available"}</p>
          <p>Weight: {user?.weight ?? "Not available"}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
