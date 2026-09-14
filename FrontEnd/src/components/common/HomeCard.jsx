import { Link } from "react-router-dom";

function HomeCard({ course }) {
  const courseId = course._id || course.id;
  const title = course.courseName || course.title || "Untitled Course";
  const duration = course.courseDuration || course.duration || "N/A";
  
  // Extract the first letter and convert to uppercase
  const firstLetter = title.charAt(0).toUpperCase();

  return (
    <Link to={`/courses/${courseId}`} className="card">
      <div className="card-avatar">
        <span>{firstLetter}</span>
      </div>
      <div className="card-body">
        <h3>{title}</h3>
        <p>within {duration}</p>
      </div>
    </Link>
  );
}

export default HomeCard;