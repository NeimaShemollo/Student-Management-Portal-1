import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../service/axiosInstance";
import { useAuthContext } from "../../contexts/useAuthContext.jsx";
import { toStudentSlug } from "./studentPath.js";

function PaymentPending() {
  const navigate = useNavigate();
  const { state, dispatch } = useAuthContext(); // Pull dispatch to update local memory store

  useEffect(() => {
    if (!state?.user) return;

    const checkStatus = setInterval(async () => {
      try {
        const res = await api.get("/payment/my-status");
        
        // If server confirms approval state
        if (res.data?.isApproved) {
          clearInterval(checkStatus);
          
          // Update global context status profile memory so Route Guard unlocks
          if (dispatch) {
            dispatch({ 
              type: "UPDATE_USER", 
              payload: { ...state.user, isApproved: true } 
            });
          }

          const studentSlug = toStudentSlug(state.user.fullName);
          navigate(`/student-dashboard/${studentSlug}`);
        }
      } catch (err) {
        console.error("Status polling failed:", err);
      }
    }, 5000);

    return () => clearInterval(checkStatus);
  }, [state?.user, navigate, dispatch]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: "2rem" }}>
      <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#780d31", animation: "pulse 1.5s infinite", marginBottom: "1.5rem" }} />
      <h1 style={{ fontFamily: "Syne", color: "#1a1216" }}>Verifying Your Payment</h1>
      <p style={{ color: "#5c5260", maxWidth: "400px" }}>Our administration console is reviewing your account receipt. This screen updates automatically—please do not close it.</p>
    </div>
  );
}

export default PaymentPending;
