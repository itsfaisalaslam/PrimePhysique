import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const filterOptions = ["All", "Muscle Gain", "Fat Loss", "Maintenance"];

const emptyMeal = {
  label: "",
  details: ""
};

const normalizeGoal = (goal) => {
  if (!goal) {
    return "";
  }

  const normalized = goal.toLowerCase();

  if (normalized === "weight loss") {
    return "fat loss";
  }

  return normalized;
};

const DietCard = ({ plan }) => {
  const meals = plan?.meals || [];

  return (
    <article className="card card-hover p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white">{plan?.title || "Untitled diet plan"}</h3>
          <p className="mt-2 max-w-2xl text-slate-300">{plan?.description || "No description available."}</p>
        </div>

        <span className="pill pill-active w-fit">
          {plan?.goal || "General"}
        </span>
      </div>

      <div className="mt-6">
        <h4 className="eyebrow">Meals</h4>

        {meals.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No meals added yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {meals.map((meal, index) => (
              <div key={`${meal?.label || "meal"}-${index}`} className="surface-muted p-4">
                <p className="font-medium text-white">{meal?.label || "Meal"}</p>
                <p className="mt-1 text-sm text-slate-400">{meal?.details || "No meal details available."}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

const Diet = () => {
  const [user, setUser] = useState(null);
  const [allDiets, setAllDiets] = useState([]);
  const [myDiets, setMyDiets] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    goal: "",
    meals: [{ ...emptyMeal }]
  });

  const loadDiets = async () => {
    const [profileResponse, dietsResponse] = await Promise.all([
      api.get("/users/profile"),
      api.get("/diets")
    ]);

    const profileUser = profileResponse.data?.user || null;
    const diets = dietsResponse.data?.dietPlans || [];

    setUser(profileUser);
    setAllDiets(diets);

    try {
      const myDietsResponse = await api.get("/diets/my");
      setMyDiets(myDietsResponse.data?.dietPlans || myDietsResponse.data?.diets || []);
    } catch (requestError) {
      const assignedDietIds = (profileUser?.assignedDietPlans || []).map((item) =>
        typeof item === "string" ? item : item?._id
      );

      const fallbackMyDiets = diets.filter((diet) => assignedDietIds.includes(diet?._id));
      setMyDiets(fallbackMyDiets);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        await loadDiets();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load diet plans.");
        setUser(null);
        setAllDiets([]);
        setMyDiets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDiets = useMemo(() => {
    if (selectedGoal === "All") {
      return allDiets;
    }

    return allDiets.filter((diet) => normalizeGoal(diet?.goal) === normalizeGoal(selectedGoal));
  }, [allDiets, selectedGoal]);

  const handleMealChange = (index, field, value) => {
    setFormData((previous) => ({
      ...previous,
      meals: previous.meals.map((meal, mealIndex) =>
        mealIndex === index ? { ...meal, [field]: value } : meal
      )
    }));
  };

  const handleGoalChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      goal: event.target.value
    }));
  };

  const addMealField = () => {
    setFormData((previous) => ({
      ...previous,
      meals: [...previous.meals, { ...emptyMeal }]
    }));
  };

  const removeMealField = (index) => {
    setFormData((previous) => ({
      ...previous,
      meals:
        previous.meals.length === 1
          ? [{ ...emptyMeal }]
          : previous.meals.filter((_, mealIndex) => mealIndex !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      goal: "",
      meals: [{ ...emptyMeal }]
    });
  };

  const handleCreateDiet = async (event) => {
    event.preventDefault();
    setCreating(true);
    setSubmitError("");
    setSubmitMessage("");

    const sanitizedMeals = formData.meals
      .filter((meal) => meal.label || meal.details)
      .map((meal) => ({
        label: meal.label,
        details: meal.details
      }));

    const payload = {
      title: `${formData.goal || "Custom"} Diet Plan`,
      description: `A nutrition plan tailored for ${formData.goal || "your current goal"}.`,
      goal: formData.goal,
      calories: 2200,
      meals: sanitizedMeals
    };

    try {
      try {
        await api.post("/diets", payload);
      } catch (requestError) {
        if (requestError.response?.status !== 404) {
          throw requestError;
        }

        await api.post("/admin/diets", payload);
      }

      setSubmitMessage("Diet plan created successfully.");
      resetForm();
      await loadDiets();
    } catch (requestError) {
      setSubmitError(requestError.response?.data?.message || "Failed to create diet plan.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="surface mx-auto max-w-4xl p-8 text-slate-200">
        Loading diet plans...
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
        <p className="section-kicker">Diet Plans</p>
        <h1 className="mt-5 section-title">Eat with intention and structure</h1>
        <p className="mt-5 section-copy">
          Explore nutrition plans by goal, review diets assigned to you, and create new diet plans if you are an admin.
        </p>
      </section>

      {user?.isAdmin && (
        <section className="surface p-8 sm:p-10">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Create Diet Plan</h2>
            <p className="text-slate-300">Add a goal-focused diet plan with a simple meal structure.</p>
          </div>

          <form onSubmit={handleCreateDiet} className="space-y-5">
            <div>
              <label htmlFor="goal" className="mb-2 block text-sm font-medium text-slate-300">
                Goal
              </label>
              <select
                id="goal"
                value={formData.goal}
                onChange={handleGoalChange}
                className="input"
                required
              >
                <option value="">Select a goal</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Meals</h3>
                <button type="button" onClick={addMealField} className="btn-secondary">
                  Add Meal
                </button>
              </div>

              {formData.meals.map((meal, index) => (
                <div key={`meal-input-${index}`} className="surface-muted p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto]">
                    <input
                      type="text"
                      value={meal.label}
                      onChange={(event) => handleMealChange(index, "label", event.target.value)}
                      className="input"
                      placeholder="Meal label"
                    />
                    <input
                      type="text"
                      value={meal.details}
                      onChange={(event) => handleMealChange(index, "details", event.target.value)}
                      className="input"
                      placeholder="Meal details"
                    />
                    <button type="button" onClick={() => removeMealField(index)} className="btn-secondary">
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
              {creating ? "Creating..." : "Create Diet"}
            </button>
          </form>
        </section>
      )}

      <section className="space-y-5">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Filter By Goal</h2>
          <p className="text-slate-300">Choose a goal to narrow the available diet plans.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {filterOptions.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => setSelectedGoal(goal)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedGoal === goal
                  ? "border-brand-400/20 bg-brand-500 text-slate-950 shadow-[0_12px_30px_rgba(20,184,166,0.22)]"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-brand-400/30 hover:text-white"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">My Diet Plans</h2>
          <p className="text-slate-300">These are the diet plans currently linked to your account.</p>
        </div>

        {myDiets.length === 0 ? (
          <div className="empty-state">
            You do not have any assigned diet plans yet.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {myDiets.map((plan) => (
              <DietCard key={plan?._id || plan?.title} plan={plan} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">All Diet Plans</h2>
          <p className="text-slate-300">Browse every nutrition plan currently available in PrimePhysique.</p>
        </div>

        {filteredDiets.length === 0 ? (
          <div className="empty-state">
            No diet plans match the selected filter.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredDiets.map((plan) => (
              <DietCard key={plan?._id || plan?.title} plan={plan} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Diet;
