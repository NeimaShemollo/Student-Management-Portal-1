import { useEffect, useState } from "react";
import "./Instracturpages.css";

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/course",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to get courses");
        }

        setCourses(data.courses || data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading courses...</div>;
  }

  return (
    <div className="instructor-page">
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Courses assigned to you</p>
        </div>
      </div>

      <div className="course-grid">
        {courses.map((course) => (
          <div className="course-card" key={course._id}>
            <div className="course-icon">📚</div>

            <h2>{course.courseName}</h2>

            <p>
              Course Code: {course.courseCode}
            </p>

            <p>
              Credits: {course.credits}
            </p>

            <p>
              Batch: {course.batchNumber}
            </p>

            <button>View Course</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorCourses;