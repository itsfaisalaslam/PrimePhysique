const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const buildApiUrl = (path = "") => {
  if (!path) {
    return API_URL;
  }

  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default API_URL;
