import { useContext } from "react";
import { Navigate, Outlet ,useLocation} from "react-router-dom";
import AuthContext from "../../contexts/authContext";

export default function ProtectedRoute({ children, adminOnly, allowedRoles }) {
  const { user, accessToken, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Restoring session...
      </div>
    );
  }

  
  if (!user || !accessToken) {
    return (
    <Navigate to="/login"
     state={{from: location.pathname,
      autoSelectCourseId:location.state?.autoSelectCourseId,
      autoSelectPrice:location.state?.autoSelectPrice
     }}
    replace 
    />
    )
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}