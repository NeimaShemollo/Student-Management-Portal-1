import { useEffect, useState } from "react";
import "./Instracturpages.css";

const InstructorGrades = () => {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const getGrades = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/grade",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setGrades(data.grades || []);
      } catch (error) {
        console.error(error);
      }
    };

    getGrades();
  }, []);

  return (
    <div className="instructor-page">
      <div className="page-header">
        <div>
          <h1>Grades</h1>
          <p>View and manage student grades</p>
        </div>
      </div>

      <div className="grades-card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Course</th>
              <th>Assignment</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>

          <tbody>
            {grades.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>

                <td>
                  {item.studentId?.fullName}
                </td>

                <td>
                  {item.courseId?.courseName}
                </td>

                <td>
                  {item.assignmentId?.title}
                </td>

                <td>{item.score}</td>

                <td>
                  <strong>{item.grade}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorGrades;