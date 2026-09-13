import { useEffect, useState } from "react";
import "./Instracturpages.css";

const InstructorAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const getAssignments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/assignment",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setAssignments(data.assignments || []);
      } catch (error) {
        console.error(error);
      }
    };

    getAssignments();
  }, []);

  return (
    <div className="instructor-page">
      <div className="page-header">
        <div>
          <h1>Assignments</h1>
          <p>Manage your assignments</p>
        </div>

        <button className="create-btn">
          + Create Assignment
        </button>
      </div>

      <div className="assignment-grid">
        {assignments.map((assignment) => (
          <div
            className="assignment-card"
            key={assignment._id}
          >
            <h2>{assignment.title}</h2>

            <p>{assignment.description}</p>

            <div className="assignment-info">
              <span>
                Due:{" "}
                {new Date(
                  assignment.dueDate
                ).toLocaleDateString()}
              </span>
            </div>

            <button>View Assignment</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorAssignments;