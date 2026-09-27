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
    <Link to={`/courses/${courseId}`} className="card" style={{ textDecoration: "none", color: "inherit", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      
      <div className="card-image-container" style={{ width: "100%", height: "160px", overflow: "hidden", position: "relative" }}>
        <img 
          src={fullImageURL} 
          alt={title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { 
            // If the uploaded file can't load or is missing, it automatically hides the broken icon and triggers your custom letter avatar frame block instead!
            e.target.style.display = 'none'; 
            e.target.nextSibling.style.display = 'flex';
          }} 
        />
        
        <div className="card-avatar" style={{ display: "none", height: "100%", width: "100%", justifyContent: "center", alignItems: "center", background: "#780d31", color: "white", fontSize: "2.5rem", fontWeight: "bold" }}>
          <span>{firstLetter}</span>
        </div>
      </div>

      <div className="card-body" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "15px" }}>
        <h3>{title}</h3>
        <p>within {duration}</p>
        
        <button 
          onClick={handleRegisterClick}
          className="card-register-btn"
          style={{
            marginTop: "auto", // Forces the button to lock cleanly at the absolute base boundary
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

