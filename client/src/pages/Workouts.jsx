import { useEffect, useState } from "react";
import api from "../services/api";

const emptyExercise = {
  name: "",
  sets: "",
  reps: ""
};

const WorkoutCard = ({ workout }) => {
  const exercises = workout?.exercises || [];

  return (
    <article className="card card-hover p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white">{workout?.name || "Untitled workout"}</h3>
          <p className="mt-2 max-w-2xl text-slate-300">{workout?.description || "No description available."}</p>
        </div>

        <span className="pill pill-active w-fit">
          {workout?.goal || "General Fitness"}
        </span>
      </div>

      <div className="mt-6">
        <h4 className="eyebrow">Exercises</h4>

        {exercises.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No exercises added yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {exercises.map((exercise, index) => (
              <div key={`${exercise?.name || "exercise"}-${index}`} className="surface-muted p-4">
                <p className="font-medium text-white">{exercise?.name || "Unnamed exercise"}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {exercise?.sets || 0} sets x {exercise?.reps || 0} reps
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

const Workouts = () => {
  const [user, setUser] = useState(null);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    description: "",
    exercises: [{ ...emptyExercise }]
  });

  const fetchWorkouts = async () => {
    const [profileResponse, workoutsResponse, myWorkoutsResponse] = await Promise.all([
      api.get("/users/profile"),
      api.get("/workouts"),
      api.get("/workouts/my")
    ]);

    setUser(profileResponse.data?.user || null);
    setAllWorkouts(workoutsResponse.data?.workouts || []);
    setMyWorkouts(myWorkoutsResponse.data?.workouts || []);
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");
        await fetchWorkouts();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load workouts.");
        setUser(null);
        setAllWorkouts([]);
        setMyWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  const handleFieldChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData((previous) => ({
      ...previous,
      exercises: previous.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const addExerciseField = () => {
    setFormData((previous) => ({
      ...previous,
      exercises: [...previous.exercises, { ...emptyExercise }]
    }));
  };

  const removeExerciseField = (index) => {
    setFormData((previous) => ({
      ...previous,
      exercises:
        previous.exercises.length === 1
          ? [{ ...emptyExercise }]
          : previous.exercises.filter((_, exerciseIndex) => exerciseIndex !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      goal: "",
      description: "",
      exercises: [{ ...emptyExercise }]
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCreating(true);
    setSubmitError("");
    setSubmitMessage("");

    const payload = {
      name: formData.name,
      goal: formData.goal,
      description: formData.description,
      exercises: formData.exercises
        .filter((exercise) => exercise.name || exercise.sets || exercise.reps)
        .map((exercise) => ({
          name: exercise.name,
          sets: Number(exercise.sets) || 0,
          reps: Number(exercise.reps) || 0
        }))
    };

    try {
      await api.post("/workouts", payload);
      setSubmitMessage("Workout created successfully.");
      resetForm();
      await fetchWorkouts();
    } catch (requestError) {
      setSubmitError(requestError.response?.data?.message || "Failed to create workout.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="surface mx-auto max-w-4xl p-8 text-slate-200">
        Loading workouts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-8 text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl page-stack fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Workout Plans</p>
        <h1 className="mt-5 section-title">Build strength with a clear plan</h1>
        <p className="mt-5 section-copy">
          Browse all available workouts, review your assigned plans, and create new programs if you are an admin.
        </p>
      </section>

      {user?.isAdmin && (
        <section className="surface p-8 sm:p-10">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Create Workout Plan</h2>
            <p className="text-slate-300">Add a new workout plan and include exercises for the program.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                  Workout Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  className="input"
                  placeholder="Upper Body Strength"
                  required
                />
              </div>

              <div>
                <label htmlFor="goal" className="mb-2 block text-sm font-medium text-slate-300">
                  Goal
                </label>
                <input
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleFieldChange}
                  className="input"
                  placeholder="Muscle Gain"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFieldChange}
                className="input min-h-28 resize-none"
                placeholder="Describe who this workout is for and how it should be followed."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Exercises</h3>
                <button type="button" onClick={addExerciseField} className="btn-secondary">
                  Add Exercise
                </button>
              </div>

              {formData.exercises.map((exercise, index) => (
                <div key={`exercise-input-${index}`} className="surface-muted p-4">
                  <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto]">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(event) => handleExerciseChange(index, "name", event.target.value)}
                      className="input"
                      placeholder="Exercise name"
                    />
                    <input
                      type="number"
                      min="0"
                      value={exercise.sets}
                      onChange={(event) => handleExerciseChange(index, "sets", event.target.value)}
                      className="input"
                      placeholder="Sets"
                    />
                    <input
                      type="number"
                      min="0"
                      value={exercise.reps}
                      onChange={(event) => handleExerciseChange(index, "reps", event.target.value)}
                      className="input"
                      placeholder="Reps"
                    />
                    <button type="button" onClick={() => removeExerciseField(index)} className="btn-secondary">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {submitError && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {submitError}
              </div>
            )}

            {submitMessage && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {submitMessage}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Create Workout"}
            </button>
          </form>
        </section>
      )}

      <section className="space-y-5">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">My Workouts</h2>
          <p className="text-slate-300">These are the workout plans currently assigned to your account.</p>
        </div>

        {myWorkouts.length === 0 ? (
          <div className="empty-state">
            You do not have any assigned workouts yet.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {myWorkouts.map((workout) => (
              <WorkoutCard key={workout?._id || workout?.name} workout={workout} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">All Workout Plans</h2>
          <p className="text-slate-300">Explore every workout plan available in PrimePhysique.</p>
        </div>

        {allWorkouts.length === 0 ? (
          <div className="empty-state">
            No workout plans are available right now.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {allWorkouts.map((workout) => (
              <WorkoutCard key={workout?._id || workout?.name} workout={workout} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Workouts;
