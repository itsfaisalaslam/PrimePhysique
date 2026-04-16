import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../services/api";

const Progress = () => {
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    performance: ""
  });

  const loadProgress = async () => {
    const response = await api.get("/progress");
    setProgressEntries(response.data?.progressEntries || []);
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError("");
        await loadProgress();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load progress history.");
        setProgressEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const chartData = useMemo(
    () =>
      progressEntries.map((entry) => ({
        date: new Date(entry?.date).toLocaleDateString(),
        weight: entry?.weight || 0
      })),
    [progressEntries]
  );

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSubmitError("");
    setSubmitMessage("");

    const payload = {
      weight: Number(formData.weight),
      performanceScore: 5,
      notes: formData.performance
    };

    try {
      await api.post("/progress", payload);
      setSubmitMessage("Progress entry saved.");
      setFormData({
        weight: "",
        performance: ""
      });
      await loadProgress();
    } catch (requestError) {
      setSubmitError(requestError.response?.data?.message || "Failed to save progress entry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="surface mx-auto max-w-5xl p-8 text-slate-200">
        Loading progress...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-8 text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl page-stack fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Progress Tracking</p>
        <h1 className="mt-5 section-title">Track your progress over time</h1>
        <p className="mt-5 section-copy">
          Log your weight and training notes, then review your progress history in a clean chart and timeline.
        </p>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="surface p-8">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Add Progress Entry</h2>
            <p className="text-slate-300">Save a new weight entry and a quick performance note.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
            <div>
              <label htmlFor="weight" className="mb-2 block text-sm font-medium text-slate-300">
                Weight
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="input"
                placeholder="Enter your current weight"
                required
              />
            </div>

            <div className="md:col-span-2 xl:col-span-1">
              <label htmlFor="performance" className="mb-2 block text-sm font-medium text-slate-300">
                Performance
              </label>
              <textarea
                id="performance"
                name="performance"
                value={formData.performance}
                onChange={handleChange}
                className="input min-h-28 resize-none"
                placeholder="Describe how training, recovery, or energy felt today."
                required
              />
            </div>

            {submitError && (
              <div className="md:col-span-2 xl:col-span-1 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {submitError}
              </div>
            )}

            {submitMessage && (
              <div className="md:col-span-2 xl:col-span-1 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {submitMessage}
              </div>
            )}

            <div className="md:col-span-2 xl:col-span-1">
              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
                {saving ? "Saving..." : "Save Progress"}
              </button>
            </div>
          </form>
        </div>

        <div className="surface p-8">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Weight Trend</h2>
            <p className="text-slate-300">Your weight history plotted by entry date.</p>
          </div>

          {chartData.length === 0 ? (
            <div className="empty-state">
              No progress data yet. Add your first entry to see the chart.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px"
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: "#2dd4bf" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-5">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Progress History</h2>
          <p className="text-slate-300">Review your previous check-ins and performance notes.</p>
        </div>

        {progressEntries.length === 0 ? (
          <div className="empty-state">
            No progress entries yet.
          </div>
        ) : (
          <div className="grid gap-5">
            {progressEntries
              .slice()
              .reverse()
              .map((entry) => (
                <article
                  key={entry?._id || entry?.date}
                  className="card card-hover p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {new Date(entry?.date).toLocaleDateString()}
                      </h3>
                      <p className="mt-2 text-slate-400">
                        {entry?.notes || "No performance note added."}
                      </p>
                    </div>

                    <div className="pill pill-active">
                      {entry?.weight || 0} kg
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Progress;
