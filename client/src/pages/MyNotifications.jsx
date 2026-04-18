import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const notificationTypeClass = (type) => {
  if (type === "expiry") {
    return "status-danger";
  }

  if (type === "payment") {
    return "status-warning";
  }

  return "status-info";
};

const emitNotificationsUpdated = () => {
  window.dispatchEvent(new Event("primephysique:notifications-updated"));
};

const MyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification?.isRead).length,
    [notifications]
  );

  const loadNotifications = async () => {
    const response = await api.get("/users/notifications");
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
      await api.put(`/users/notifications/${notificationId}/read`);
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
      <div className="surface mx-auto max-w-5xl p-8 text-slate-200">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="page-shell max-w-5xl fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Notifications</p>
        <h1 className="mt-5 section-title">My Alerts</h1>
        <p className="mt-5 section-copy">
          Review membership expiry alerts, payment reminders, and general updates.
        </p>
        <div className="mt-6 inline-flex rounded-full bg-brand-500/15 px-4 py-2 text-sm font-medium text-brand-300">
          Unread notifications: {unreadCount}
        </div>
      </section>

      {error && (
        <div className="alert-error">{error}</div>
      )}

      {notifications.length === 0 ? (
        <div className="empty-state">You have no notifications right now.</div>
      ) : (
        <div className="grid gap-5">
          {notifications.map((notification) => (
            <article
              key={notification?._id}
              className={`card transition duration-200 ${
                notification?.isRead
                  ? "border-white/5 bg-[#081225]"
                  : "border-brand-400/30 bg-brand-400/10 shadow-[0_18px_45px_rgba(20,184,166,0.14)]"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className={`status-badge ${notificationTypeClass(notification?.type)}`}>
                    {notification?.type || "general"}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {notification?.title || "PrimePhysique Update"}
                    </h2>
                    <p className="mt-2 text-slate-300">
                      {notification?.message || "Notification message unavailable."}
                    </p>
                  </div>
                  <p className="text-sm text-slate-400">
                    {notification?.createdAt ? new Date(notification.createdAt).toLocaleString() : "-"}
                  </p>
                </div>

                {!notification?.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notification?._id)}
                    className="btn-secondary"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotifications;
