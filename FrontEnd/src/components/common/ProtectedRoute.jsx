// src/components/common/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../../contexts/authContext";

export default function ProtectedRoute({ children, adminOnly, allowedRoles }) {
  const { user, accessToken, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Restoring session...
      </div>
    );
  }

  // 1. Check login state
  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Admin role restriction if adminOnly flag is set
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 3. Check allowed roles array if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. Return children if used as wrapper (<ProtectedRoute><AdminDashboard /></ProtectedRoute>)
  //    Otherwise return <Outlet /> for direct route layout usage
  return children ? children : <Outlet />;
}