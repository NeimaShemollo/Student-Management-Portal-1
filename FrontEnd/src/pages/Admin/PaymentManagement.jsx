import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateColumnHelper } from "@tanstack/react-table";
import DataTable from "../../components/admin/DataTable";
import {
  formatPaymentStatus,
  getAllPayments,
  getCourseIdDisplay,
  paymentStatusClass,
  reviewPayment,
} from "../../service/paymentService.js";
import "./AdminShared.css";
import "./PaymentManagement.css";

const columnHelper = CreateColumnHelper();

function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const visiblePayments = useMemo(() => {
    if (statusFilter === "all") return payments;
    return payments.filter((p) => {
      if (statusFilter === "rejected") {
        return p.status === "rejected" || p.status === "denied";
      }
      return p.status === statusFilter;
    });
  }, [payments, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "student",
        header: "Student",
        cell: ({ row }) => (
          <div className="admin-cellStack">
            <strong>{row.original.studentId?.fullName || "Unknown"}</strong>
            <small>{row.original.studentId?.emailAddress || "—"}</small>
          </div>
        ),
      }),
      columnHelper.display({
        id: "courseId",
        header: "Course ID",
        cell: ({ row }) => getCourseIdDisplay(row.original.courseId),
      }),
      columnHelper.accessor("coursePrice", { header: "Course Price" }),
      columnHelper.accessor("amount", { header: "Amount" }),
      columnHelper.accessor("transactionId", {
        header: "Transaction ID",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="admin-cellStack">
              <span
                className={`admin-statusBadge admin-statusBadge--${paymentStatusClass(status)}`}
              >
                {formatPaymentStatus(status)}
              </span>
              {status === "pending" ? (
                <div className="admin-rowActions">
                  <button
                    type="button"
                    className="admin-approveBtn"
                    onClick={() => handleReview(row.original._id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="admin-dangerBtn"
                    onClick={() => handleReview(row.original._id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          );
        },
      }),
    ],
    [handleReview]
  );

  return (
    <div className="admin-page payments-page">
      <div className="payments-header">
        <div>
          <h2 className="admin-pageTitle">Payment Receipts</h2>
          <p className="admin-pageLead">
            Filter and review student payment submissions.
          </p>
        </div>
        <select
          className="admin-filterSelect"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {message && <p className="admin-msg admin-msg--success">{message}</p>}
      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      <div className="admin-card">
        {loading ? (
          <p className="admin-pageLead">Loading payments…</p>
        ) : (
          <DataTable
            data={visiblePayments}
            columns={columns}
            searchPlaceholder="Search payments…"
            emptyMessage="No payment records match this filter."
          />
        )}
      </div>
    </div>
  );
}

export default PaymentManagement;
