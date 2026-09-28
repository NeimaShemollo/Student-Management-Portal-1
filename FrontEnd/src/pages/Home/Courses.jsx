import SiteNav from "../../components/common/SiteNav.jsx";
import { useState, useEffect } from "react";
import HomeCard from "../../components/common/HomeCard.jsx";
import { api } from "../../service/axiosInstance.js";
import "./Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Initialize the state directly by reading localStorage immediately
  const [isAdmin] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      return parsedUser.role === "admin";
    }
    return false;
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/course/view");
        const courseList = res.data?.data ?? res.data ?? [];
        setCourses(Array.isArray(courseList) ? courseList : []);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError('loading course failed');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []); 

  return (
    <div className="courses-page">
      <SiteNav />

      <div className="courses-hero">
        <h1>Our Courses</h1>
        <p>Pick a course to see what it covers.</p>
        
        {isAdmin && (
          <button 
            className="admin-toggle-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{ marginTop: '15px', padding: '10px 20px', cursor: 'pointer' }}
          >
            {showCreateForm ? "Close Form" : "➕ Add New Course"}
          </button>
        )}
      </div>

      {loading && <p className="loading-state">Loading courses...</p>}
      {error && <p className="error-state">{error}</p>}

      {!loading && !error && (
        <div className="courses-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          
          {/* 🌟 THE INDICATOR: Clean, user-friendly informational tip banner */}
          <div className="course-click-indicator" style={{ background: "#fbf8f9", border: "1px dashed rgba(120,13,49,0.2)", padding: "12px", borderRadius: "8px", textAlign: "center", marginBottom: "1.5rem", color: "#780d31", fontWeight: "600", fontSize: "0.92rem" }}>
            💡 Tip: Click on any course card below to read its full description, curriculum syllabus, and requirements!
          </div>

          <div className="courses-grid">
            {courses.length > 0 ? (
              courses.map((course) => (
                <HomeCard key={course._id || course.id} course={course} />
              ))
            ) : (
              <p>No courses available right now.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
