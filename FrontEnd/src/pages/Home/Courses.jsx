import SiteNav from "../../components/common/SiteNav.jsx";
import { useState, useEffect } from "react";
import HomeCard from "../../components/common/HomeCard.jsx";
import { api } from "../../service/axiosInstance.js";

import "./Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States to check user roles and open the upload form
  const [showCreateForm, setShowCreateForm] = useState(false);
  // 1. Initialize the state directly by reading localStorage immediately
const [isAdmin] = useState(() => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    return parsedUser.role === "admin"; // Returns true or false directly
  }
  return false;
});


// 2. Your useEffect now handles ONLY the network data synchronization stream
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
        
        {/* 3. Show 'Add Course' button ONLY if the logged in user is an admin */}
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
        <div className="courses-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <HomeCard key={course._id || course.id} course={course} />
            ))
          ) : (
            <p>No courses available right now.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Courses;

