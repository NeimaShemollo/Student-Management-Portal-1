import { api } from "./axiosInstance.js";

export const submitPayment = (paymentData) => {
  return api.post("/payment/submit", paymentData);
};

export const getMyPayments = () => {
  return api.get("/payment/my-payments");
};

export const getAllPayments = () => {
  return api.get("/payment");
};

export const reviewPayment = (id, status) => {
  return api.put(`/payment/review/${id}`, { status });
};

export function formatPaymentStatus(status) {
  if (status === "approved") return "Approved";
  if (status === "rejected" || status === "denied") return "Rejected";
  return "Pending";
}

export function paymentStatusClass(status) {
  if (status === "approved") return "approved";
  if (status === "rejected" || status === "denied") return "rejected";
  return "pending";
}

export function getCourseIdDisplay(courseId) {
  if (!courseId) return "—";
  if (typeof courseId === "object") {
    return String(courseId.courseCode || courseId._id || "—");
  }
  return String(courseId);
}
