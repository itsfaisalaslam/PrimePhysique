import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-brand-400 to-cyan-400 text-slate-950 shadow-[0_12px_30px_rgba(20,184,166,0.22)]"
      : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

const panelNavLinkClass = ({ isActive }) =>
  `inline-flex items-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-brand-400 to-cyan-400 text-slate-950 shadow-[0_10px_24px_rgba(20,184,166,0.2)]"
      : "border border-white/5 bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
  }`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const moreMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const isLoggedIn = Boolean(localStorage.getItem("token") || localStorage.getItem("primephysique_token"));
  const storedUser = localStorage.getItem("user") || localStorage.getItem("primephysique_user");
  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  const [notifications, setNotifications] = useState([]);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification?.isRead).length,
    [notifications]
  );

  const allLinks = useMemo(() => {
    if (!isLoggedIn) {
      return [];
    }

    return [
      { to: "/dashboard", label: "Dashboard" },
      ...(currentUser?.isAdmin ? [{ to: "/admin-users", label: "Users" }] : []),
      { to: "/workouts", label: "Workouts" },
      { to: "/diets", label: "Diets" },
      { to: "/progress", label: "Progress" },
      ...(currentUser?.isAdmin ? [{ to: "/admin-notifications", label: "Notifications" }] : []),
      ...(currentUser?.isAdmin ? [{ to: "/admin-dashboard", label: "Admin Dashboard" }] : []),
      ...(currentUser?.isAdmin ? [{ to: "/admin-analytics", label: "Analytics" }] : []),
      ...(currentUser?.isAdmin ? [{ to: "/admin-attendance", label: "Attendance" }] : []),
      ...(currentUser?.isAdmin ? [{ to: "/admin-trainers", label: "Trainers" }] : []),
      { to: "/my-payments", label: "Payments" },
      { to: "/my-attendance", label: "Attendance Log" },
      { to: "/ai-generator", label: "AI Builder" },
      { to: "/calendar", label: "Calendar" },
      { to: "/chat", label: "Chat" }
    ];
  }, [currentUser?.isAdmin, isLoggedIn]);

  const primaryDesktopLinks = useMemo(() => {
    if (!isLoggedIn) {
      return [];
    }

    return allLinks.filter((link) =>
      ["/dashboard", "/admin-users", "/workouts", "/diets", "/progress", "/admin-notifications"].includes(link.to)
    );
  }, [allLinks, isLoggedIn]);

  const moreLinks = useMemo(() => {
    if (!isLoggedIn) {
      return [];
    }

    return allLinks.filter((link) => !primaryDesktopLinks.some((primaryLink) => primaryLink.to === link.to));
  }, [allLinks, isLoggedIn, primaryDesktopLinks]);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      return undefined;
    }

    const loadNotifications = async () => {
      try {
        const response = await api.get("/users/notifications");
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

  useEffect(() => {
    setIsMoreMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("primephysique_token");
    localStorage.removeItem("primephysique_user");
    setNotifications([]);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050b1a]/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center">
          <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-brand-400/95 via-cyan-400 to-sky-300 text-base font-bold text-slate-950 shadow-[0_14px_30px_rgba(20,184,166,0.22)]">
              P
            </span>
            <div className="min-w-0">
              <p className="truncate text-[1.15rem] font-semibold tracking-tight text-white sm:text-[1.25rem]">
                Prime<span className="text-brand-400">Physique</span>
              </p>
              <p className="hidden text-xs font-medium uppercase tracking-[0.22em] text-slate-500 sm:block">
                Fitness Command Center
              </p>
            </div>
          </Link>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
          {isLoggedIn && (
            <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-2 py-2">
              {primaryDesktopLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}

              {moreLinks.length > 0 && (
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen((currentValue) => !currentValue)}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isMoreMenuOpen
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    More
                    <span className={`text-xs transition-transform duration-200 ${isMoreMenuOpen ? "rotate-180" : ""}`}>
                      v
                    </span>
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 rounded-3xl border border-white/10 bg-[#081225] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                      <div className="grid gap-2">
                        {moreLinks.map((link) => (
                          <NavLink key={link.to} to={link.to} className={panelNavLinkClass}>
                            {link.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 shrink-0">
          {isLoggedIn && (
            <div className="relative xl:hidden" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-brand-400/25 hover:bg-white/[0.06] hover:text-white"
                aria-label="Open navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                Menu
                <span className={`text-xs transition-transform duration-200 ${isMobileMenuOpen ? "rotate-180" : ""}`}>
                  v
                </span>
              </button>

              {isMobileMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-[#081225] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {allLinks.map((link) => (
                      <NavLink key={link.to} to={link.to} className={panelNavLinkClass}>
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoggedIn && (
            <Link
              to="/notifications"
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-slate-200 transition-all duration-200 hover:border-brand-400/25 hover:bg-white/[0.06] hover:text-white"
              aria-label="Notifications"
            >
              <span className="relative">
                <span role="img" aria-label="Notifications">
                  {"\uD83D\uDD14"}
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-[0_10px_20px_rgba(244,63,94,0.28)]">
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

          {isLoggedIn && currentUser?.name && (
            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 xl:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <div className="max-w-[140px]">
                <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {currentUser?.isAdmin ? "Administrator" : "Member"}
                </p>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <button type="button" onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
