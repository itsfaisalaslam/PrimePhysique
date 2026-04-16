import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 ${
    isActive
      ? "bg-brand-500 text-slate-950 shadow-[0_12px_30px_rgba(20,184,166,0.28)]"
      : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("primephysique_token"));
  const [notifications, setNotifications] = useState([]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification?.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      return undefined;
    }

    const loadNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        setNotifications(response.data?.notifications || []);
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
    window.addEventListener("primephysique:notifications-updated", loadNotifications);
    window.addEventListener("focus", loadNotifications);

    return () => {
      window.removeEventListener("primephysique:notifications-updated", loadNotifications);
      window.removeEventListener("focus", loadNotifications);
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("primephysique_token");
    setNotifications([]);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 shadow-[0_18px_40px_rgba(2,6,23,0.2)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-cyan-300 text-lg font-extrabold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.28)]">
            P
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Prime<span className="text-brand-400">Physique</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/workouts" className={navLinkClass}>
                Workouts
              </NavLink>
              <NavLink to="/diets" className={navLinkClass}>
                Diets
              </NavLink>
              <NavLink to="/progress" className={navLinkClass}>
                Progress
              </NavLink>
              <NavLink to="/ai-generator" className={navLinkClass}>
                AI Builder
              </NavLink>
              <NavLink to="/notifications" className={navLinkClass}>
                <span className="flex items-center gap-2">
                  <span role="img" aria-label="Notifications">
                    {"\uD83D\uDD14"}
                  </span>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </NavLink>
              <NavLink to="/calendar" className={navLinkClass}>
                Calendar
              </NavLink>
              <NavLink to="/chat" className={navLinkClass}>
                Chat
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn && (
            <Link
              to="/notifications"
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-slate-200 transition duration-200 hover:border-brand-400/30 hover:text-white lg:hidden"
              aria-label="Notifications"
            >
              <span className="relative">
                <span role="img" aria-label="Notifications">
                  {"\uD83D\uDD14"}
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </span>
            </Link>
          )}

          {!isLoggedIn && location.pathname !== "/login" && (
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
          )}

          {!isLoggedIn && location.pathname !== "/register" && (
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          )}

          {isLoggedIn && (
            <button type="button" onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          )}
        </div>
      </nav>

      {isLoggedIn && (
        <div className="glass-divider lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/workouts" className={navLinkClass}>
              Workouts
            </NavLink>
            <NavLink to="/diets" className={navLinkClass}>
              Diets
            </NavLink>
            <NavLink to="/progress" className={navLinkClass}>
              Progress
            </NavLink>
            <NavLink to="/ai-generator" className={navLinkClass}>
              AI Builder
            </NavLink>
            <NavLink to="/calendar" className={navLinkClass}>
              Calendar
            </NavLink>
            <NavLink to="/chat" className={navLinkClass}>
              Chat
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
