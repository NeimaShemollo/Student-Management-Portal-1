import SiteNav from "../../components/common/SiteNav.jsx";
import {useState,useEffect} from "react"
import HomeCard from "../../components/common/HomeCard.jsx";
import { api } from "../../service/axiosInstance.js";

import "./Courses.css";

function Courses() {
const [courses,setCourses]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState(null)

  useEffect(() => {
  const fetchCourses = async () => {
    try {
      const res = await api.get("/course/view"); // Adjust path if routed under /api/course/view
      // Extract array from response payload
      const courseList = res.data?.data ?? res.data ?? [];
      setCourses(Array.isArray(courseList) ? courseList : []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError('loading course failed')
    }finally{
      setLoading(false)
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
      </div>

  {loading && <p className="loading-state">Loading courses...</p>}
      {error && <p className="error-state">{error}</p>}

      {!loading && !error && (
        <div className="courses-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              // Ensure key uses _id or id depending on your database schema
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
