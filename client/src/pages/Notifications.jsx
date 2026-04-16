import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const notificationColors = {
  workout: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  diet: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  reminder: "border-amber-500/30 bg-amber-500/10 text-amber-200"
};

const emitNotificationsUpdated = () => {
  window.dispatchEvent(new Event("primephysique:notifications-updated"));
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification?.isRead).length,
    [notifications]
  );

  const loadNotifications = async () => {
    const response = await api.get("/notifications");
    setNotifications(response.data?.notifications || []);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");
        await loadNotifications();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load notifications.");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    emitNotificationsUpdated();
  }, [notifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((previous) =>
        previous.map((notification) =>
          notification?._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update notification.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/75 p-8 text-slate-200 backdrop-blur">
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-8 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-300">Notifications</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Stay on top of your plan updates</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Review your latest workout, diet, and reminder notifications. Unread items stay highlighted until you mark them as read.
        </p>
        <div className="mt-5 inline-flex rounded-full bg-brand-500/15 px-4 py-2 text-sm font-medium text-brand-300">
          Unread notifications: {unreadCount}
        </div>
      </section>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 text-slate-400 backdrop-blur">
          You have no notifications right now.
        </div>
      ) : (
        <div className="grid gap-5">
          {notifications.map((notification) => {
            const typeClasses =
              notificationColors[notification?.type] || "border-slate-700 bg-slate-800/70 text-slate-200";

            return (
              <article
                key={notification?._id}
                className={`rounded-3xl border p-6 backdrop-blur ${
                  notification?.isRead
                    ? "border-slate-800 bg-slate-900/65"
                    : "border-brand-500/30 bg-brand-500/10 shadow-glow"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeClasses}`}>
                      {notification?.type || "notification"}
                    </div>
                    <p className="text-lg text-white">{notification?.message || "Notification message unavailable."}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(notification?.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!notification?.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification?._id)}
                      className="btn-secondary"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
