import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token") || localStorage.getItem("primephysique_token");
  const storedUser = localStorage.getItem("user") || localStorage.getItem("primephysique_user");
  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
