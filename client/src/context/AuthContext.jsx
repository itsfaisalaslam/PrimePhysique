import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("primephysique_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Rehydrate the logged-in user whenever the app refreshes.
      const { data } = await axiosInstance.get("/users/me");
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem("primephysique_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (formData) => {
    const { data } = await axiosInstance.post("/auth/login", formData);
    localStorage.setItem("primephysique_token", data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await axiosInstance.post("/auth/register", formData);
    localStorage.setItem("primephysique_token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("primephysique_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      refreshUser: loadUser
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
