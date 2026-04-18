import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
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

    try {
      const response = await api.post(`${API_URL}/api/auth/login`, formData);
      const token = response.data?.token;
      const user = response.data?.user;

      // Temporary debug logs to verify the admin flag coming from the backend.
      console.log("Login response user:", user);
      console.log("Login response user.isAdmin:", user?.isAdmin);

      if (!token) {
        throw new Error("Token not received from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("primephysique_token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("primephysique_user", JSON.stringify(user));
      }

      if (user?.isAdmin === true) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card fade-in-up">
      <h1 className="text-3xl font-bold text-white">Login</h1>
      <p className="mt-2 text-slate-400">Sign in to access your PrimePhysique dashboard.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <div className="alert-error">{error}</div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-brand-300 hover:text-brand-200">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
