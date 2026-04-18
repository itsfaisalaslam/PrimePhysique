import { useEffect, useState } from "react";
import api from "../services/api";

const paymentBadgeClass = (status) => {
  if (status === "paid") {
    return "status-success";
  }

  if (status === "partial") {
    return "status-warning";
  }

  return "status-danger";
};

const formatDisplayDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
};

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/payments");
        setPayments(response.data?.payments || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load payment history.");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  if (loading) {
    return (
      <div className="surface mx-auto max-w-5xl p-8 text-slate-200">
        Loading payment history...
      </div>
    );
  }

  return (
    <div className="page-shell fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Membership Payments</p>
        <h1 className="mt-5 section-title">My Payments</h1>
        <p className="mt-5 section-copy">
          Track your membership fee, paid amount, pending amount, and payment status in one place.
        </p>
      </section>

      <section className="surface p-8">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Payment History</h2>
          <p className="text-slate-300">Your latest payments appear first.</p>
        </div>

        {error && (
          <div className="alert-error mb-5">{error}</div>
        )}

        {payments.length === 0 ? (
          <div className="empty-state">No payments have been recorded yet.</div>
        ) : (
          <div className="table-shell">
            <div className="table-scroll">
              <table className="table-base">
                <thead className="table-head">
                  <tr>
                    <th className="table-header-cell">Membership Plan</th>
                    <th className="table-header-cell">Total Fee</th>
                    <th className="table-header-cell">Amount Paid</th>
                    <th className="table-header-cell">Pending Amount</th>
                    <th className="table-header-cell">Payment Status</th>
                    <th className="table-header-cell">Payment Date</th>
                    <th className="table-header-cell">Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment?._id} className="table-row">
                      <td className="table-cell text-white">{payment?.membershipPlan || "None"}</td>
                      <td className="table-cell">{formatCurrency(payment?.totalFee)}</td>
                      <td className="table-cell">{formatCurrency(payment?.amountPaid)}</td>
                      <td className="table-cell">{formatCurrency(payment?.pendingAmount)}</td>
                      <td className="table-cell">
                        <span className={`status-badge ${paymentBadgeClass(payment?.paymentStatus)}`}>
                          {payment?.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td className="table-cell">{formatDisplayDate(payment?.paymentDate)}</td>
                      <td className="table-cell">{payment?.paymentMethod || "cash"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyPayments;
