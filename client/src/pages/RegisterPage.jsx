import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { goalOptions } from "../utils/formOptions";

const initialState = {
  name: "",
  email: "",
  password: "",
  age: "",
  height: "",
  weight: "",
  fitnessGoal: "General Fitness"
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl card p-8">
      <h1 className="font-display text-4xl font-bold text-white">Create your account</h1>
      <p className="mt-3 text-slate-400">Tell PrimePhysique a little about your fitness goals.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
          <input name="name" value={formData.name} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            minLength="6"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Height (cm)</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Weight (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="input" required />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">Fitness Goal</label>
          <select name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} className="input" required>
            {goalOptions.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="md:col-span-2 text-sm text-rose-400">{error}</p>}

        <div className="md:col-span-2">
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
