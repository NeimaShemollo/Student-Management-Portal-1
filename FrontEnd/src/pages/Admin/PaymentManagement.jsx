import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatPaymentStatus,
  getAllPayments,
  getCourseIdDisplay,
  paymentStatusClass,
  reviewPayment,
} from "../../service/paymentService.js";
import "./AdminShared.css";
import "./PaymentManagement.css";

function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // 🌟 ADDED SEARCH STATE: Aligns the native filtering feel with your other lists
  const [searchTerm, setSearchFilter] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const res = await getAllPayments();
        const rows = res.data?.data ?? res.data ?? [];
        setPayments(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const handleReview = useCallback(async (id, status) => {
    setMessage("");
    setError("");
    try {
      await reviewPayment(id, status);
      setPayments((prev) =>
        prev.map((payment) =>
          payment._id === id ? { ...payment, status } : payment
        )
      );
      setMessage(`Payment ${formatPaymentStatus(status).toLowerCase()} successfully.`);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update payment status"
      );
    }
  }, []);

  // 🌟 NATIVE COMPUTE: Merges status selection and search inputs into a single active loop
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // 1. Evaluate Status Dropdown Filters
      if (statusFilter !== "all") {
        if (statusFilter === "rejected") {
          if (p.status !== "rejected" && p.status !== "denied") return false;
        } else if (p.status !== statusFilter) {
          return false;
        }
      }

      // 2. Evaluate Native Text Search Filters
      const searchString = searchTerm.toLowerCase();
      const studentName = (p.studentId?.fullName || "").toLowerCase();
      const studentEmail = (p.studentId?.emailAddress || "").toLowerCase();
      const transactionId = (p.transactionId || "").toLowerCase();

      return (
        studentName.includes(searchString) ||
        studentEmail.includes(searchString) ||
        transactionId.includes(searchString)
      );
    });
  }, [payments, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-pageLead">Launching active workspace data links...</p>
      </div>
    );
  }

  return (
    <div className="admin-page payments-page">
      <div className="payments-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h2 className="admin-pageTitle">Payment Receipts</h2>
          <p className="admin-pageLead">
            Filter and review student payment submissions.
          </p>
        </div>
      </div>

      {message && <p className="admin-msg admin-msg--success">{message}</p>}
      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      {/* 🌟 UNIFIED SEARCH & FILTER CONTROLS HUB */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search receipts by student, email, or transaction ID..."
          value={searchTerm}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ padding: "0.65rem 1rem", width: "100%", maxWidth: "360px", borderRadius: "8px", border: "1px solid rgba(120,13,49,0.12)", fontSize: "0.9rem" }}
        />

        <select
          className="admin-filterSelect"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid rgba(120,13,49,0.12)", background: "#fff", fontSize: "0.9rem", cursor: "pointer" }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected / Denied</option>
        </select>
      </div>

      {/* 🌟 UNIFIED NATIVE HIGH-PERFORMANCE TABLE LAYOUT */}
      <div className="admin-card" style={{ padding: "1.5rem", overflowX: "auto", background: "#fff", borderRadius: "12px" }}>
        <table className="student-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(120,13,49,0.12)", background: "#fbfbfc" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Student</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Course ID</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Course Price</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Amount Paid</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Transaction ID</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Status & Verification Controls</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((p) => (
                <tr key={p._id} style={{ borderBottom: "1px solid rgba(120,13,49,0.12)" }}>
                  <td style={{ padding: "12px" }}>
                    <div className="admin-cellStack">
                      <strong>{p.studentId?.fullName || "Unknown Student"}</strong>
                      <small style={{ color: "var(--bt-muted)", fontSize: "0.8rem" }}>{p.studentId?.emailAddress || "—"}</small>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <code>{getCourseIdDisplay(p.courseId)}</code>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    ETB {(p.coursePrice || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "700" }}>
                    ETB {(p.amount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <code>{p.transactionId || "—"}</code>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div className="admin-cellStack" style={{ alignItems: "center", gap: "6px" }}>
                      <span className={`admin-statusBadge admin-statusBadge--${paymentStatusClass(p.status)}`}>
                        {formatPaymentStatus(p.status)}
                      </span>
                      
                      {p.status === "pending" && (
                        <div className="admin-rowActions" style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          <button
                            type="button"
                            className="admin-approveBtn"
                            onClick={() => handleReview(p._id, "approved")}
                            style={{ background: "#28a745", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600" }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            type="button"
                            className="admin-dangerBtn"
                            onClick={() => handleReview(p._id, "rejected")}
                            style={{ background: "#dc3545", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600" }}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--bt-muted)" }}>
                  No payment records match your active search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentManagement;
