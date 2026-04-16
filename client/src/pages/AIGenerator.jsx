import { useState } from "react";
import api from "../services/api";

const initialForm = {
  goal: "muscle gain",
  experienceLevel: "beginner",
  daysPerWeek: 3
};

const AIGenerator = () => {
  const [formData, setFormData] = useState(initialForm);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setGeneratedWorkout(null);

    try {
      const response = await api.post("/ai/workout", {
        goal: formData.goal,
        experienceLevel: formData.experienceLevel,
        daysPerWeek: Number(formData.daysPerWeek)
      });

      setGeneratedWorkout(response.data?.workout || null);
      setMessage(
        response.data?.source === "openai"
          ? "Workout generated with OpenAI."
          : "Workout generated with the built-in smart planner."
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to generate workout.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedWorkout) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api.post("/ai/workout/save", {
        name: generatedWorkout.name,
        exercises: generatedWorkout.exercises || [],
        goal: formData.goal,
        experienceLevel: formData.experienceLevel,
        daysPerWeek: Number(formData.daysPerWeek)
      });

      setMessage("Workout saved to your workouts successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save workout.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-8 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">AI Workout Generator</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Generate a custom workout in seconds</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Choose your goal, training level, and weekly schedule. PrimePhysique will build a workout plan just for you.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-8 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Plan Settings</h2>
            <p className="mt-2 text-slate-400">Set a few inputs and generate your workout plan.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label htmlFor="goal" className="mb-2 block text-sm font-medium text-slate-300">
                Goal
              </label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="input"
              >
                <option value="muscle gain">Muscle Gain</option>
                <option value="fat loss">Fat Loss</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label htmlFor="experienceLevel" className="mb-2 block text-sm font-medium text-slate-300">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label htmlFor="daysPerWeek" className="mb-2 block text-sm font-medium text-slate-300">
                Days Per Week
              </label>
              <input
                id="daysPerWeek"
                type="number"
                min="1"
                max="7"
                name="daysPerWeek"
                value={formData.daysPerWeek}
                onChange={handleChange}
                className="input"
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Generating...
                </span>
              ) : (
                "Generate Workout"
              )}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-8 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Generated Plan</h2>
            <p className="mt-2 text-slate-400">Your custom plan will appear here after generation.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          {!generatedWorkout ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-400">
              No workout generated yet. Fill the form and click Generate Workout.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-5">
                <h3 className="text-2xl font-semibold text-white">{generatedWorkout?.name || "Generated Workout"}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Goal: {formData.goal} | Level: {formData.experienceLevel} | Days: {formData.daysPerWeek}
                </p>
              </div>

              <div className="grid gap-4">
                {(generatedWorkout?.exercises || []).map((exercise, index) => (
                  <div
                    key={`${exercise?.name || "exercise"}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <p className="font-semibold text-white">{exercise?.name || "Exercise"}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {exercise?.sets || 0} sets x {exercise?.reps || 0} reps
                    </p>
                  </div>
                ))}
              </div>

              <button type="button" onClick={handleSave} className="btn-secondary" disabled={saving}>
                {saving ? "Saving..." : "Save Workout"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AIGenerator;
