import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const emptyWorkout = {
  title: "",
  description: "",
  level: "Beginner",
  goal: "General Fitness",
  daysPerWeek: 3,
  exercises: JSON.stringify(
    [{ name: "Squat", sets: 4, reps: 8, details: "Focus on form and tempo." }],
    null,
    2
  )
};

const emptyDiet = {
  title: "",
  description: "",
  goal: "Weight Loss",
  calories: 2100,
  meals: JSON.stringify(
    [{ label: "Breakfast", details: "Oats, berries, and Greek yogurt." }],
    null,
    2
  )
};

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [diets, setDiets] = useState([]);
  const [workoutForm, setWorkoutForm] = useState(emptyWorkout);
  const [dietForm, setDietForm] = useState(emptyDiet);
  const [editingWorkoutId, setEditingWorkoutId] = useState("");
  const [editingDietId, setEditingDietId] = useState("");
  const [assignment, setAssignment] = useState({
    userId: "",
    workoutPlanIds: [],
    dietPlanIds: []
  });

  const loadAdminData = async () => {
    const [usersResponse, workoutsResponse, dietsResponse] = await Promise.all([
      axiosInstance.get("/admin/users"),
      axiosInstance.get("/admin/workouts"),
      axiosInstance.get("/admin/diets")
    ]);

    setUsers(usersResponse.data.users);
    setWorkouts(workoutsResponse.data.workoutPlans);
    setDiets(dietsResponse.data.dietPlans);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleWorkoutSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...workoutForm,
      exercises: JSON.parse(workoutForm.exercises)
    };

    if (editingWorkoutId) {
      await axiosInstance.put(`/admin/workouts/${editingWorkoutId}`, payload);
    } else {
      await axiosInstance.post("/admin/workouts", payload);
    }

    setEditingWorkoutId("");
    setWorkoutForm(emptyWorkout);
    loadAdminData();
  };

  const handleDietSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...dietForm,
      meals: JSON.parse(dietForm.meals)
    };

    if (editingDietId) {
      await axiosInstance.put(`/admin/diets/${editingDietId}`, payload);
    } else {
      await axiosInstance.post("/admin/diets", payload);
    }

    setEditingDietId("");
    setDietForm(emptyDiet);
    loadAdminData();
  };

  const handleDeleteWorkout = async (id) => {
    await axiosInstance.delete(`/admin/workouts/${id}`);
    loadAdminData();
  };

  const handleDeleteDiet = async (id) => {
    await axiosInstance.delete(`/admin/diets/${id}`);
    loadAdminData();
  };

  const handleDeleteUser = async (id) => {
    await axiosInstance.delete(`/admin/users/${id}`);
    loadAdminData();
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();
    await axiosInstance.post("/workouts/assign", assignment);
    setAssignment({ userId: "", workoutPlanIds: [], dietPlanIds: [] });
    loadAdminData();
  };

  const handleMultiSelect = (event, key) => {
    const values = Array.from(event.target.selectedOptions, (option) => option.value);
    setAssignment((previous) => ({ ...previous, [key]: values }));
  };

  const startWorkoutEdit = (plan) => {
    setEditingWorkoutId(plan._id);
    setWorkoutForm({
      title: plan.title,
      description: plan.description,
      level: plan.level,
      goal: plan.goal,
      daysPerWeek: plan.daysPerWeek,
      exercises: JSON.stringify(plan.exercises, null, 2)
    });
  };

  const startDietEdit = (plan) => {
    setEditingDietId(plan._id);
    setDietForm({
      title: plan.title,
      description: plan.description,
      goal: plan.goal,
      calories: plan.calories,
      meals: JSON.stringify(plan.meals, null, 2)
    });
  };

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-2xl font-bold text-white">Manage Users</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Goal</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id} className="border-t border-slate-800">
                    <td className="py-3 text-white">{item.name}</td>
                    <td className="py-3 text-slate-300">{item.email}</td>
                    <td className="py-3 text-slate-300">{item.fitnessGoal}</td>
                    <td className="py-3 text-slate-300">{item.role}</td>
                    <td className="py-3">
                      {item.role !== "admin" && (
                        <button type="button" onClick={() => handleDeleteUser(item._id)} className="text-sm font-semibold text-rose-400">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleAssignmentSubmit} className="card p-6">
          <h2 className="text-2xl font-bold text-white">Assign Plans</h2>
          <div className="mt-6 space-y-4">
            <select
              className="input"
              value={assignment.userId}
              onChange={(event) => setAssignment((previous) => ({ ...previous, userId: event.target.value }))}
              required
            >
              <option value="">Select user</option>
              {users.filter((user) => user.role !== "admin").map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              multiple
              className="input min-h-40"
              value={assignment.workoutPlanIds}
              onChange={(event) => handleMultiSelect(event, "workoutPlanIds")}
            >
              {workouts.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.title}
                </option>
              ))}
            </select>

            <select
              multiple
              className="input min-h-40"
              value={assignment.dietPlanIds}
              onChange={(event) => handleMultiSelect(event, "dietPlanIds")}
            >
              {diets.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.title}
                </option>
              ))}
            </select>

            <button className="btn-primary w-full" type="submit">
              Assign Selected Plans
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <form onSubmit={handleWorkoutSubmit} className="card p-6">
          <h2 className="text-2xl font-bold text-white">
            {editingWorkoutId ? "Edit Workout Plan" : "Add Workout Plan"}
          </h2>
          <div className="mt-6 grid gap-4">
            <input className="input" placeholder="Title" value={workoutForm.title} onChange={(event) => setWorkoutForm((previous) => ({ ...previous, title: event.target.value }))} required />
            <textarea className="input min-h-24 resize-none" placeholder="Description" value={workoutForm.description} onChange={(event) => setWorkoutForm((previous) => ({ ...previous, description: event.target.value }))} required />
            <input className="input" placeholder="Level" value={workoutForm.level} onChange={(event) => setWorkoutForm((previous) => ({ ...previous, level: event.target.value }))} required />
            <input className="input" placeholder="Goal" value={workoutForm.goal} onChange={(event) => setWorkoutForm((previous) => ({ ...previous, goal: event.target.value }))} required />
            <input type="number" className="input" placeholder="Days per week" value={workoutForm.daysPerWeek} onChange={(event) => setWorkoutForm((previous) => ({ ...previous, daysPerWeek: event.target.value }))} required />
            <textarea className="input min-h-48 font-mono text-sm" value={workoutForm.exercises} onChange={(event) => setWorkoutForm((previous) => ({ ...previous, exercises: event.target.value }))} required />
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" type="submit">
                {editingWorkoutId ? "Update Workout Plan" : "Save Workout Plan"}
              </button>
              {editingWorkoutId && (
                <button type="button" className="btn-secondary" onClick={() => {
                  setEditingWorkoutId("");
                  setWorkoutForm(emptyWorkout);
                }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </form>

        <form onSubmit={handleDietSubmit} className="card p-6">
          <h2 className="text-2xl font-bold text-white">
            {editingDietId ? "Edit Diet Plan" : "Add Diet Plan"}
          </h2>
          <div className="mt-6 grid gap-4">
            <input className="input" placeholder="Title" value={dietForm.title} onChange={(event) => setDietForm((previous) => ({ ...previous, title: event.target.value }))} required />
            <textarea className="input min-h-24 resize-none" placeholder="Description" value={dietForm.description} onChange={(event) => setDietForm((previous) => ({ ...previous, description: event.target.value }))} required />
            <input className="input" placeholder="Goal" value={dietForm.goal} onChange={(event) => setDietForm((previous) => ({ ...previous, goal: event.target.value }))} required />
            <input type="number" className="input" placeholder="Calories" value={dietForm.calories} onChange={(event) => setDietForm((previous) => ({ ...previous, calories: event.target.value }))} required />
            <textarea className="input min-h-48 font-mono text-sm" value={dietForm.meals} onChange={(event) => setDietForm((previous) => ({ ...previous, meals: event.target.value }))} required />
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" type="submit">
                {editingDietId ? "Update Diet Plan" : "Save Diet Plan"}
              </button>
              {editingDietId && (
                <button type="button" className="btn-secondary" onClick={() => {
                  setEditingDietId("");
                  setDietForm(emptyDiet);
                }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </form>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white">Existing Workout Plans</h2>
          <div className="mt-6 space-y-4">
            {workouts.map((plan) => (
              <div key={plan._id} className="rounded-2xl bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{plan.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => startWorkoutEdit(plan)} className="text-sm font-semibold text-brand-300">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteWorkout(plan._id)} className="text-sm font-semibold text-rose-400">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white">Existing Diet Plans</h2>
          <div className="mt-6 space-y-4">
            {diets.map((plan) => (
              <div key={plan._id} className="rounded-2xl bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{plan.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => startDietEdit(plan)} className="text-sm font-semibold text-brand-300">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteDiet(plan._id)} className="text-sm font-semibold text-rose-400">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
