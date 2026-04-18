import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const notificationTypes = ["general", "expiry", "payment"];

const initialForm = {
  title: "",
  message: "",
  type: "general"
};

const AdminNotifications = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userForm, setUserForm] = useState(initialForm);
  const [broadcastForm, setBroadcastForm] = useState(initialForm);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sendingUser, setSendingUser] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [generatingAuto, setGeneratingAuto] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const regularUsers = useMemo(
    () => users.filter((user) => !user?.isAdmin && user?.role !== "admin"),
    [users]
  );

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError("");

        const response = await api.get("/admin/users");
        const fetchedUsers = response.data?.users || [];
        setUsers(fetchedUsers);

        const firstUser = fetchedUsers.find((user) => !user?.isAdmin && user?.role !== "admin");
        setSelectedUserId(firstUser?._id || "");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load users.");
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const handleFormChange = (setter) => (event) => {
    const { name, value } = event.target;

    setter((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSendToUser = async (event) => {
    event.preventDefault();

    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }

    try {
      setSendingUser(true);
      setError("");
      setMessage("");

      await api.post(`/admin/notifications/user/${selectedUserId}`, userForm);
      setMessage("Notification sent to selected user.");
      setUserForm(initialForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to send notification.");
    } finally {
      setSendingUser(false);
    }
  };

  const handleBroadcast = async (event) => {
    event.preventDefault();

    try {
      setSendingBroadcast(true);
      setError("");
      setMessage("");

      const response = await api.post("/admin/notifications/broadcast", broadcastForm);
      setMessage(`Broadcast sent to ${response.data?.count || 0} users.`);
      setBroadcastForm(initialForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to broadcast notification.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleAutoGenerate = async () => {
    try {
      setGeneratingAuto(true);
      setError("");
      setMessage("");

      const response = await api.post("/admin/notifications/auto-generate");
      setMessage(`Auto notifications created: ${response.data?.createdCount || 0}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to auto-generate notifications.");
    } finally {
      setGeneratingAuto(false);
    }
  };

  const renderNotificationFields = (form, onChange, prefix) => (
    <>
      <div>
        <label htmlFor={`${prefix}Title`} className="mb-2 block text-sm font-medium text-slate-300">
          Title
        </label>
        <input
          id={`${prefix}Title`}
          name="title"
          value={form.title}
          onChange={onChange}
          className="input"
          placeholder="Notification title"
          required
        />
      </div>

      <div>
        <label htmlFor={`${prefix}Type`} className="mb-2 block text-sm font-medium text-slate-300">
          Type
        </label>
        <select id={`${prefix}Type`} name="type" value={form.type} onChange={onChange} className="input">
          {notificationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <label htmlFor={`${prefix}Message`} className="mb-2 block text-sm font-medium text-slate-300">
          Message
        </label>
        <textarea
          id={`${prefix}Message`}
          name="message"
          value={form.message}
          onChange={onChange}
          className="input min-h-32"
          placeholder="Write the notification message"
          required
        />
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl page-stack fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Admin Notifications</p>
        <h1 className="mt-5 section-title">Send Alerts</h1>
        <p className="mt-5 section-copy">
          Send direct updates, broadcast announcements, and generate automatic membership or payment reminders.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSendToUser} className="surface p-8">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Send to Specific User</h2>
            <p className="text-slate-300">Choose one member and send a targeted alert.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="selectedUserId" className="mb-2 block text-sm font-medium text-slate-300">
                User
              </label>
              <select
                id="selectedUserId"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                className="input"
                disabled={loadingUsers}
              >
                {regularUsers.map((user) => (
                  <option key={user?._id} value={user?._id}>
                    {user?.name} - {user?.email}
                  </option>
                ))}
              </select>
            </div>

            {renderNotificationFields(userForm, handleFormChange(setUserForm), "user")}
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn-primary" disabled={sendingUser || loadingUsers}>
              {sendingUser ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>

        <form onSubmit={handleBroadcast} className="surface p-8">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Broadcast to Users</h2>
            <p className="text-slate-300">Send the same notification to every non-admin user.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {renderNotificationFields(broadcastForm, handleFormChange(setBroadcastForm), "broadcast")}
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn-primary" disabled={sendingBroadcast}>
              {sendingBroadcast ? "Broadcasting..." : "Broadcast Notification"}
            </button>
          </div>
        </form>
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Auto Notifications</h2>
          <p className="text-slate-300">
            Generate expiry warnings, expired membership alerts, and pending payment reminders.
          </p>
        </div>

        <button type="button" onClick={handleAutoGenerate} className="btn-secondary" disabled={generatingAuto}>
          {generatingAuto ? "Generating..." : "Generate Auto Notifications"}
        </button>
      </section>
    </div>
  );
};

export default AdminNotifications;
