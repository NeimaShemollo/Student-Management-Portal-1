import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/useAuthContext.jsx";
import { toStudentSlug } from "../../pages/Student/studentPath.js"; 

function HomeCard({ course }) {
  const navigate = useNavigate();
  const { state } = useAuthContext(); 
  const user = state?.user;
  
  const courseId = course._id || course.id;
  const title = course.courseName || course.title || "Untitled Course";
  const duration = course.courseDuration || course.duration || "N/A";
  
  const firstLetter = title.charAt(0).toUpperCase();

  const backendBaseURL = "http://localhost:5000";
  const fullImageURL = `${backendBaseURL}/${course.image}`;

  const handleRegisterClick = (e) => {
    e.preventDefault();  
    e.stopPropagation(); 

    if (!user) {
      navigate("/register", {
        state: {
          fromCourseCheckout: true,
          autoSelectCourseId: courseId,
          autoSelectPrice: course.coursePrice || course.price || 0
        }
      });
    } else {
      const studentFullName = user?.fullName || user?.name || "student";
      const cleanStudentSlug = toStudentSlug(studentFullName);

      navigate(`/student-dashboard/${cleanStudentSlug}/payments`, {
        state: {
          autoSelectCourseId: courseId,
          autoSelectPrice: course.coursePrice || course.price || 0
        }
      });
    }
  };

  return (
    <Link 
      to={`/courses/${courseId}`} 
      className="card home-course-card" 
      style={{ 
        textDecoration: "none", 
        color: "inherit", 
        overflow: "hidden", 
        display: "flex", 
        flexDirection: "column",
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
      // 🌟 ADDED HOVER EFFECTS: Changes card elevation so students know it's a link
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(120, 13, 49, 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="card-image-container" style={{ width: "100%", height: "160px", overflow: "hidden", position: "relative" }}>
        <img 
          src={fullImageURL} 
          alt={title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { 
            e.target.style.display = 'none'; 
            e.target.nextSibling.style.display = 'flex';
          }} 
        />
        
        <div className="card-avatar" style={{ display: "none", height: "100%", width: "100%", justifyContent: "center", alignItems: "center", background: "#780d31", color: "white", fontSize: "2.5rem", fontWeight: "bold" }}>
          <span>{firstLetter}</span>
        </div>
      </div>

      <div className="card-body" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "15px", flexGrow: 1 }}>
        <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2rem", fontWeight: "700" }}>{title}</h3>
        <p style={{ margin: "0 0 15px 0", color: "#6c757d", fontSize: "0.9rem" }}>within {duration}</p>
        
        {/* 🌟 THE INDICATOR HOOK: Gives students explicit visual advice */}
        <div style={{ margin: "0 0 15px 0", fontSize: "0.82rem", color: "#007bff", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
          📄 View Full Details & Syllabus ➔
        </div>

        <button 
          onClick={handleRegisterClick}
          className="card-register-btn"
          style={{
            marginTop: "auto", 
            padding: "8px 12px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            width: "fit-content"
          }}
        >
          Register Now ➔
        </button>
      </div>
    </Link>
  );
}

export default HomeCard;
