import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const membershipPlans = ["Basic", "Standard", "Premium", "None"];
const membershipStatuses = ["active", "expired", "none"];
const paymentMethods = ["cash", "upi", "card", "bank", "other"];
const attendanceStatuses = ["present", "absent"];

const formatDateForInput = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
};

const getTodayDateInput = () => new Date().toISOString().slice(0, 10);

const membershipBadgeClass = (status) => {
  if (status === "active") {
    return "bg-emerald-500/15 text-emerald-300";
  }

  if (status === "expired") {
    return "bg-rose-500/15 text-rose-300";
  }

  return "bg-slate-500/15 text-slate-300";
};

const paymentBadgeClass = (status) => {
  if (status === "paid") {
    return "bg-emerald-500/15 text-emerald-300";
  }

  if (status === "partial") {
    return "bg-amber-500/15 text-amber-300";
  }

  return "bg-rose-500/15 text-rose-300";
};

const attendanceBadgeClass = (status) => {
  if (status === "present") {
    return "bg-emerald-500/15 text-emerald-300";
  }

  return "bg-rose-500/15 text-rose-300";
};

const formatDisplayDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
};

const formatDisplayDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
};

const badgeBaseClass = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
const adminInputClass = "w-full rounded-xl border border-white/10 bg-[#050f20] px-3 py-2 text-sm text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500";
const adminButtonBaseClass = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition duration-200";
const adminPrimaryButtonClass = `${adminButtonBaseClass} bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:scale-[1.02] hover:opacity-90`;
const adminSecondaryButtonClass = `${adminButtonBaseClass} border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white`;
const adminDangerButtonClass = `${adminButtonBaseClass} bg-red-500/20 text-red-400 hover:bg-red-500/25`;
const adminUtilityButtonClass = `${adminButtonBaseClass} border border-cyan-400/15 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15`;
const adminTableHeaderClass = "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400";
const adminTableRowClass = "border-t border-white/5 bg-[#081225] transition hover:bg-white/5";
const adminTableWrapClass = "w-full mt-4 overflow-x-auto rounded-2xl border border-white/5 bg-[#081225] overflow-hidden";

const AdminModal = ({ children, maxWidth = "max-w-5xl" }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
    <div className="min-h-screen flex items-start justify-center px-4 pt-20 pb-8">
      <div className={`w-full ${maxWidth} rounded-3xl border border-white/5 bg-[#081225] shadow-2xl max-h-[80vh] overflow-y-auto p-6`}>
        {children}
      </div>
    </div>
  </div>
);

const ModalHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const ModalTableWrap = ({ children }) => (
  <div className="mt-4 overflow-x-auto rounded-2xl border border-white/5 bg-[#081225]">
    {children}
  </div>
);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [membershipForm, setMembershipForm] = useState({
    membershipPlan: "None",
    membershipFee: 0,
    membershipStartDate: "",
    membershipEndDate: "",
    membershipStatus: "none"
  });
  const [savingMembership, setSavingMembership] = useState(false);
  const [paymentUser, setPaymentUser] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    membershipPlan: "None",
    totalFee: 0,
    amountPaid: 0,
    paymentMethod: "cash",
    notes: ""
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentsUser, setPaymentsUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [attendanceUser, setAttendanceUser] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    date: getTodayDateInput(),
    status: "present",
    notes: ""
  });
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceHistoryUser, setAttendanceHistoryUser] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [assigningTrainerUser, setAssigningTrainerUser] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [savingTrainerAssignment, setSavingTrainerAssignment] = useState(false);

  const loadUsers = async () => {
    const response = await api.get("/admin/users");
    setUsers(response.data?.users || []);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        await loadUsers();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load users.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) =>
      user?.name?.toLowerCase().includes(normalizedSearch) ||
      user?.email?.toLowerCase().includes(normalizedSearch)
    );
  }, [searchTerm, users]);

  const handleDeleteUser = async (userId, userName) => {
    const shouldDelete = window.confirm(`Are you sure you want to delete this user?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingUserId(userId);
      setError("");
      setActionMessage("");

      await api.delete(`/admin/users/${userId}`);
      setActionMessage("User deleted successfully.");
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingUserId("");
    }
  };

  const handleOpenMembershipEditor = (user) => {
    setEditingUser(user);
    setMembershipForm({
      membershipPlan: user?.membershipPlan || "None",
      membershipFee: user?.membershipFee ?? 0,
      membershipStartDate: formatDateForInput(user?.membershipStartDate),
      membershipEndDate: formatDateForInput(user?.membershipEndDate),
      membershipStatus: user?.membershipStatus || "none"
    });
    setError("");
    setActionMessage("");
  };

  const handleMembershipFieldChange = (event) => {
    const { name, value } = event.target;

    setMembershipForm((previous) => {
      if (name === "membershipPlan" && value === "None") {
        return {
          ...previous,
          membershipPlan: value,
          membershipFee: 0,
          membershipStatus: "none"
        };
      }

      return {
        ...previous,
        [name]: value
      };
    });
  };

  const handleMembershipSubmit = async (event) => {
    event.preventDefault();

    if (!editingUser?._id) {
      return;
    }

    try {
      setSavingMembership(true);
      setError("");
      setActionMessage("");

      await api.put(`/admin/users/${editingUser._id}/membership`, {
        membershipPlan: membershipForm.membershipPlan,
        membershipFee: Number(membershipForm.membershipFee) || 0,
        membershipStartDate: membershipForm.membershipStartDate || null,
        membershipEndDate: membershipForm.membershipEndDate || null,
        membershipStatus: membershipForm.membershipStatus
      });

      setActionMessage("Membership updated successfully.");
      setEditingUser(null);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update membership.");
    } finally {
      setSavingMembership(false);
    }
  };

  const handleOpenPaymentForm = (user) => {
    setPaymentUser(user);
    setPaymentForm({
      membershipPlan: user?.membershipPlan || "None",
      totalFee: user?.membershipFee ?? 0,
      amountPaid: 0,
      paymentMethod: "cash",
      notes: ""
    });
    setError("");
    setActionMessage("");
  };

  const handlePaymentFieldChange = (event) => {
    const { name, value } = event.target;

    setPaymentForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!paymentUser?._id) {
      return;
    }

    try {
      setSavingPayment(true);
      setError("");
      setActionMessage("");

      await api.post(`/admin/users/${paymentUser._id}/payments`, {
        membershipPlan: paymentForm.membershipPlan,
        totalFee: Number(paymentForm.totalFee) || 0,
        amountPaid: Number(paymentForm.amountPaid) || 0,
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      });

      setActionMessage("Payment recorded successfully.");
      setPaymentUser(null);

      if (paymentsUser?._id === paymentUser._id) {
        await handleViewPayments(paymentUser);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to record payment.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleViewPayments = async (user) => {
    try {
      setPaymentsUser(user);
      setLoadingPayments(true);
      setError("");
      setPayments([]);

      const response = await api.get(`/admin/users/${user?._id}/payments`);
      setPayments(response.data?.payments || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load payment history.");
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleOpenAttendanceForm = (user) => {
    setAttendanceUser(user);
    setAttendanceForm({
      date: getTodayDateInput(),
      status: "present",
      notes: ""
    });
    setError("");
    setActionMessage("");
  };

  const handleAttendanceFieldChange = (event) => {
    const { name, value } = event.target;

    setAttendanceForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const submitAttendance = async (user, payload) => {
    const response = await api.post(`/admin/users/${user?._id}/attendance`, payload);
    return response.data?.attendance;
  };

  const handleAttendanceSubmit = async (event) => {
    event.preventDefault();

    if (!attendanceUser?._id) {
      return;
    }

    try {
      setSavingAttendance(true);
      setError("");
      setActionMessage("");

      await submitAttendance(attendanceUser, {
        date: attendanceForm.date,
        status: attendanceForm.status,
        notes: attendanceForm.notes
      });

      setActionMessage("Attendance marked successfully.");
      setAttendanceUser(null);

      if (attendanceHistoryUser?._id === attendanceUser._id) {
        await handleViewAttendance(attendanceUser);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleQuickTodayPresent = async (user) => {
    try {
      setError("");
      setActionMessage("");

      await submitAttendance(user, {
        date: getTodayDateInput(),
        status: "present",
        notes: "Quick check-in from admin users page"
      });

      setActionMessage(`${user?.name || "User"} marked present for today.`);

      if (attendanceHistoryUser?._id === user?._id) {
        await handleViewAttendance(user);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to mark today's attendance.");
    }
  };

  const handleViewAttendance = async (user) => {
    try {
      setAttendanceHistoryUser(user);
      setLoadingAttendance(true);
      setError("");
      setAttendanceHistory([]);

      const response = await api.get(`/admin/users/${user?._id}/attendance`);
      setAttendanceHistory(response.data?.attendance || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load attendance history.");
      setAttendanceHistory([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleOpenTrainerAssignment = async (user) => {
    try {
      setAssigningTrainerUser(user);
      setSelectedTrainerId(user?.assignedTrainer?._id || "");
      setLoadingTrainers(true);
      setError("");
      setActionMessage("");

      const response = await api.get("/admin/trainers");
      const trainerList = response.data?.trainers || [];
      setTrainers(trainerList);

      if (!user?.assignedTrainer?._id && trainerList.length > 0) {
        setSelectedTrainerId(trainerList[0]?._id || "");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load trainers.");
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  };

  const handleTrainerAssignmentSubmit = async (event) => {
    event.preventDefault();

    if (!assigningTrainerUser?._id || !selectedTrainerId) {
      setError("Please select a trainer before saving.");
      return;
    }

    try {
      setSavingTrainerAssignment(true);
      setError("");
      setActionMessage("");

      await api.put(`/admin/users/${assigningTrainerUser._id}/assign-trainer`, {
        trainerId: selectedTrainerId
      });

      setActionMessage("Trainer assigned successfully.");
      setAssigningTrainerUser(null);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to assign trainer.");
    } finally {
      setSavingTrainerAssignment(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-4 text-slate-200">
        Loading users...
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 fade-in-up">
      <div className="flex w-full flex-col items-start gap-4">
      <section className="surface w-full p-4 sm:p-5">
        <p className="section-kicker">Admin Users</p>
        <h1 className="mt-2 section-title">Manage Users</h1>
        <p className="mt-2 section-copy">
          Search the user base, review roles, and remove accounts when needed from one clean admin workspace.
        </p>
      </section>

      <section className="surface w-full p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-white">User Directory</h2>
          <p className="mt-2 text-sm text-slate-300">Filter users by name or email and manage accounts safely.</p>
        </div>

        <div className="mb-4 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={adminInputClass}
            placeholder="Search by name or email"
          />
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {actionMessage}
          </div>
        )}

        {filteredUsers.length === 0 ? (
          <div className="empty-state">No users matched your search.</div>
        ) : (
          <div className={adminTableWrapClass}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className={adminTableHeaderClass}>Name</th>
                    <th className={adminTableHeaderClass}>Email</th>
                    <th className={adminTableHeaderClass}>Role</th>
                    <th className={adminTableHeaderClass}>Assigned Trainer</th>
                    <th className={adminTableHeaderClass}>Membership</th>
                    <th className={adminTableHeaderClass}>Fee</th>
                    <th className={adminTableHeaderClass}>Status</th>
                    <th className={adminTableHeaderClass}>End Date</th>
                    <th className={adminTableHeaderClass}>Joined Date</th>
                    <th className={adminTableHeaderClass}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user?._id} className={adminTableRowClass}>
                      <td className="px-3 py-2 text-sm text-white">{user?.name || "Unknown user"}</td>
                      <td className="px-3 py-2 text-sm text-slate-300">{user?.email || "No email"}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`${badgeBaseClass} ${user?.isAdmin || user?.role === "admin" ? "bg-orange-500/15 text-orange-300" : user?.role === "trainer" ? "bg-sky-500/15 text-sky-300" : "bg-brand-500/15 text-brand-200"}`}>
                          {user?.isAdmin || user?.role === "admin" ? "Admin" : user?.role === "trainer" ? "Trainer" : "User"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-300">
                        {user?.assignedTrainer?.name || "No trainer assigned"}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-300">{user?.membershipPlan || "None"}</td>
                      <td className="px-3 py-2 text-sm text-slate-300">{user?.membershipFee ?? 0}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`${badgeBaseClass} ${membershipBadgeClass(user?.membershipStatus)}`}>
                          {user?.membershipStatus || "none"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-300">
                        {user?.membershipEndDate ? new Date(user.membershipEndDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-300">
                        {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenMembershipEditor(user)}
                            className={adminUtilityButtonClass}
                          >
                            Edit Membership
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenTrainerAssignment(user)}
                            className={adminUtilityButtonClass}
                          >
                            Assign Trainer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentForm(user)}
                            className={adminPrimaryButtonClass}
                          >
                            Add Payment
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewPayments(user)}
                            className={adminSecondaryButtonClass}
                          >
                            View Payments
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickTodayPresent(user)}
                            className={adminPrimaryButtonClass}
                          >
                            Today Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAttendanceForm(user)}
                            className={adminUtilityButtonClass}
                          >
                            Mark Attendance
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewAttendance(user)}
                            className={adminSecondaryButtonClass}
                          >
                            View Attendance
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user?._id, user?.name)}
                            disabled={deletingUserId === user?._id || user?.isAdmin}
                            className={`${adminDangerButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {deletingUserId === user?._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </section>
      </div>

      {editingUser && (
        <AdminModal maxWidth="max-w-3xl">
            <ModalHeader
              title="Edit Membership"
              subtitle={`Update membership details for ${editingUser?.name || "this user"}.`}
            />

            <form onSubmit={handleMembershipSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="membershipPlan" className="mb-2 block text-sm font-medium text-slate-300">
                  Membership Plan
                </label>
                <select
                  id="membershipPlan"
                  name="membershipPlan"
                  value={membershipForm.membershipPlan}
                  onChange={handleMembershipFieldChange}
                  className={adminInputClass}
                >
                  {membershipPlans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="membershipFee" className="mb-2 block text-sm font-medium text-slate-300">
                  Membership Fee
                </label>
                <input
                  id="membershipFee"
                  type="number"
                  min="0"
                  name="membershipFee"
                  value={membershipForm.membershipFee}
                  onChange={handleMembershipFieldChange}
                  className={adminInputClass}
                />
              </div>

              <div>
                <label htmlFor="membershipStartDate" className="mb-2 block text-sm font-medium text-slate-300">
                  Membership Start Date
                </label>
                <input
                  id="membershipStartDate"
                  type="date"
                  name="membershipStartDate"
                  value={membershipForm.membershipStartDate}
                  onChange={handleMembershipFieldChange}
                  className={adminInputClass}
                />
              </div>

              <div>
                <label htmlFor="membershipEndDate" className="mb-2 block text-sm font-medium text-slate-300">
                  Membership End Date
                </label>
                <input
                  id="membershipEndDate"
                  type="date"
                  name="membershipEndDate"
                  value={membershipForm.membershipEndDate}
                  onChange={handleMembershipFieldChange}
                  className={adminInputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="membershipStatus" className="mb-2 block text-sm font-medium text-slate-300">
                  Membership Status
                </label>
                <select
                  id="membershipStatus"
                  name="membershipStatus"
                  value={membershipForm.membershipStatus}
                  onChange={handleMembershipFieldChange}
                  className={adminInputClass}
                >
                  {membershipStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={adminSecondaryButtonClass}
                  disabled={savingMembership}
                >
                  Cancel
                </button>
                <button type="submit" className={adminPrimaryButtonClass} disabled={savingMembership}>
                  {savingMembership ? "Saving..." : "Save Membership"}
                </button>
              </div>
            </form>
        </AdminModal>
      )}

      {assigningTrainerUser && (
        <AdminModal maxWidth="max-w-3xl">
            <ModalHeader
              title="Assign Trainer"
              subtitle={`Choose a trainer for ${assigningTrainerUser?.name || "this user"}.`}
            />

            {loadingTrainers ? (
              <div className="mt-4 empty-state">Loading trainers...</div>
            ) : trainers.length === 0 ? (
              <div className="mt-4 empty-state">No trainers found. Add users with role trainer first.</div>
            ) : (
              <form onSubmit={handleTrainerAssignmentSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="trainerId" className="mb-2 block text-sm font-medium text-slate-300">
                    Trainer
                  </label>
                  <select
                  id="trainerId"
                  value={selectedTrainerId}
                  onChange={(event) => setSelectedTrainerId(event.target.value)}
                  className={adminInputClass}
                >
                    {trainers.map((trainer) => (
                      <option key={trainer?._id} value={trainer?._id}>
                        {trainer?.name} - {trainer?.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setAssigningTrainerUser(null)}
                    className={adminSecondaryButtonClass}
                    disabled={savingTrainerAssignment}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={adminPrimaryButtonClass} disabled={savingTrainerAssignment}>
                    {savingTrainerAssignment ? "Saving..." : "Save Trainer"}
                  </button>
                </div>
              </form>
            )}
        </AdminModal>
      )}

      {paymentUser && (
        <AdminModal maxWidth="max-w-3xl">
            <ModalHeader
              title="Add Payment"
              subtitle={`Record a membership payment for ${paymentUser?.name || "this user"}.`}
            />

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="paymentMembershipPlan" className="mb-2 block text-sm font-medium text-slate-300">
                  Membership Plan
                </label>
                <select
                  id="paymentMembershipPlan"
                  name="membershipPlan"
                  value={paymentForm.membershipPlan}
                  onChange={handlePaymentFieldChange}
                  className={adminInputClass}
                >
                  {membershipPlans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="totalFee" className="mb-2 block text-sm font-medium text-slate-300">
                  Total Fee
                </label>
                <input
                  id="totalFee"
                  type="number"
                  min="0"
                  name="totalFee"
                  value={paymentForm.totalFee}
                  onChange={handlePaymentFieldChange}
                  className={adminInputClass}
                />
              </div>

              <div>
                <label htmlFor="amountPaid" className="mb-2 block text-sm font-medium text-slate-300">
                  Amount Paid
                </label>
                <input
                  id="amountPaid"
                  type="number"
                  min="0"
                  name="amountPaid"
                  value={paymentForm.amountPaid}
                  onChange={handlePaymentFieldChange}
                  className={adminInputClass}
                />
              </div>

              <div>
                <label htmlFor="paymentMethod" className="mb-2 block text-sm font-medium text-slate-300">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={paymentForm.paymentMethod}
                  onChange={handlePaymentFieldChange}
                  className={adminInputClass}
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="paymentNotes" className="mb-2 block text-sm font-medium text-slate-300">
                  Notes
                </label>
                <textarea
                  id="paymentNotes"
                  name="notes"
                  value={paymentForm.notes}
                  onChange={handlePaymentFieldChange}
                  className={`${adminInputClass} min-h-28`}
                  placeholder="Optional payment notes"
                />
              </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentUser(null)}
                  className={adminSecondaryButtonClass}
                  disabled={savingPayment}
                >
                  Cancel
                </button>
                <button type="submit" className={adminPrimaryButtonClass} disabled={savingPayment}>
                  {savingPayment ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
        </AdminModal>
      )}

      {paymentsUser && (
        <AdminModal>
            <ModalHeader
              title="Payment History"
              subtitle={`Payments recorded for ${paymentsUser?.name || "this user"}.`}
              action={
                <button type="button" onClick={() => setPaymentsUser(null)} className={adminSecondaryButtonClass}>
                  Close
                </button>
              }
            />

            {loadingPayments ? (
              <div className="mt-4 empty-state">Loading payment history...</div>
            ) : payments.length === 0 ? (
              <div className="mt-4 empty-state">No payments recorded yet.</div>
            ) : (
              <ModalTableWrap>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-white/[0.03]">
                        <th className={adminTableHeaderClass}>Plan</th>
                        <th className={adminTableHeaderClass}>Total Fee</th>
                        <th className={adminTableHeaderClass}>Amount Paid</th>
                        <th className={adminTableHeaderClass}>Pending</th>
                        <th className={adminTableHeaderClass}>Status</th>
                        <th className={adminTableHeaderClass}>Payment Date</th>
                        <th className={adminTableHeaderClass}>Method</th>
                        <th className={adminTableHeaderClass}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment?._id} className={adminTableRowClass}>
                          <td className="px-3 py-2 text-white">{payment?.membershipPlan || "None"}</td>
                          <td className="px-3 py-2 text-slate-300">{payment?.totalFee ?? 0}</td>
                          <td className="px-3 py-2 text-slate-300">{payment?.amountPaid ?? 0}</td>
                          <td className="px-3 py-2 text-slate-300">{payment?.pendingAmount ?? 0}</td>
                          <td className="px-3 py-2">
                            <span className={`${badgeBaseClass} ${paymentBadgeClass(payment?.paymentStatus)}`}>
                              {payment?.paymentStatus || "unpaid"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-300">{formatDisplayDate(payment?.paymentDate)}</td>
                          <td className="px-3 py-2 text-slate-300">{payment?.paymentMethod || "cash"}</td>
                          <td className="px-3 py-2 text-slate-300">{payment?.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </ModalTableWrap>
            )}
        </AdminModal>
      )}

      {attendanceUser && (
        <AdminModal maxWidth="max-w-3xl">
            <ModalHeader
              title="Mark Attendance"
              subtitle={`Record gym attendance for ${attendanceUser?.name || "this user"}.`}
            />

            <form onSubmit={handleAttendanceSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="attendanceDate" className="mb-2 block text-sm font-medium text-slate-300">
                  Date
                </label>
                <input
                  id="attendanceDate"
                  type="date"
                  name="date"
                  value={attendanceForm.date}
                  onChange={handleAttendanceFieldChange}
                  className={adminInputClass}
                />
              </div>

              <div>
                <label htmlFor="attendanceStatus" className="mb-2 block text-sm font-medium text-slate-300">
                  Status
                </label>
                <select
                  id="attendanceStatus"
                  name="status"
                  value={attendanceForm.status}
                  onChange={handleAttendanceFieldChange}
                  className={adminInputClass}
                >
                  {attendanceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="attendanceNotes" className="mb-2 block text-sm font-medium text-slate-300">
                  Notes
                </label>
                <textarea
                  id="attendanceNotes"
                  name="notes"
                  value={attendanceForm.notes}
                  onChange={handleAttendanceFieldChange}
                  className={`${adminInputClass} min-h-28`}
                  placeholder="Optional attendance notes"
                />
              </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAttendanceUser(null)}
                  className={adminSecondaryButtonClass}
                  disabled={savingAttendance}
                >
                  Cancel
                </button>
                <button type="submit" className={adminPrimaryButtonClass} disabled={savingAttendance}>
                  {savingAttendance ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </form>
        </AdminModal>
      )}

      {attendanceHistoryUser && (
        <AdminModal>
            <ModalHeader
              title="Attendance History"
              subtitle={`Attendance records for ${attendanceHistoryUser?.name || "this user"}.`}
              action={
                <button type="button" onClick={() => setAttendanceHistoryUser(null)} className={adminSecondaryButtonClass}>
                  Close
                </button>
              }
            />

            {loadingAttendance ? (
              <div className="mt-4 empty-state">Loading attendance history...</div>
            ) : attendanceHistory.length === 0 ? (
              <div className="mt-4 empty-state">No attendance records yet.</div>
            ) : (
              <ModalTableWrap>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-white/[0.03]">
                        <th className={adminTableHeaderClass}>Date</th>
                        <th className={adminTableHeaderClass}>Status</th>
                        <th className={adminTableHeaderClass}>Check-in Time</th>
                        <th className={adminTableHeaderClass}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.map((entry) => (
                        <tr key={entry?._id} className={adminTableRowClass}>
                          <td className="px-3 py-2 text-white">{formatDisplayDate(entry?.date)}</td>
                          <td className="px-3 py-2">
                            <span className={`${badgeBaseClass} ${attendanceBadgeClass(entry?.status)}`}>
                              {entry?.status || "present"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-300">{formatDisplayDateTime(entry?.checkInTime)}</td>
                          <td className="px-3 py-2 text-slate-300">{entry?.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </ModalTableWrap>
            )}
        </AdminModal>
      )}
    </div>
  );
};

export default AdminUsers;
