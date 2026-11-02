import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/useAuthContext.jsx";

function PaidStudentGuard({ children }) {
  const { state } = useAuthContext();
  const user = state?.user;

  // If the admin hasn't verified payment yet, bounce them to the waiting page
  if (user && !user.isApproved) {
    return <Navigate to="/payment-pending" replace />;
  }

  return children;
}

export default PaidStudentGuard;
