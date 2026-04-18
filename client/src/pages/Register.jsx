import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await api.post("/auth/signup", formData);
      setSuccessMessage("Registration successful. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card fade-in-up">
      <h1 className="text-3xl font-bold text-white">Create Account</h1>
      <p className="mt-2 text-slate-400">Join PrimePhysique and start tracking your fitness journey.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            placeholder="Create a password"
            required
          />
        </div>

        {error && (
          <div className="alert-error">{error}</div>
        )}

        {successMessage && (
          <div className="alert-success">{successMessage}</div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
