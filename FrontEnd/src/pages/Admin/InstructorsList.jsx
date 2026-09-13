// src/pages/Admin/InstructorsList.jsx
import { useEffect, useMemo, useState } from "react";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { getInstructors } from "../../service/userService.js";
import { getCourses, assignCourseToInstructor } from "../../service/courseService.js";
import { api } from "../../service/axiosInstance.js";
import DataTable from "../../components/admin/DataTable";
import "./AdminShared.css";

const columnHelper = legacyCreateColumnHelper();

function InstructorsList() {
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Modal State for Course Assignment
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [instRes, courseRes] = await Promise.all([
          getInstructors(),
          getCourses().catch(() => ({ data: [] })),
        ]);

        const instructorRows = instRes.data?.data ?? instRes.data ?? [];
        const courseRows = courseRes.data?.data ?? courseRes.data ?? [];

        setInstructors(Array.isArray(instructorRows) ? instructorRows : []);
        setCourses(Array.isArray(courseRows) ? courseRows : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleStatusChange = async (instructorId, newStatus) => {
    setUpdatingId(instructorId);
    setError("");
    try {
      await api.patch(`/users/status/${instructorId}`, { status: newStatus });
      setInstructors((prev) =>
        prev.map((ins) =>
          ins._id === instructorId ? { ...ins, status: newStatus } : ins
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignCourseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstructor || !selectedCourseId) return;

    setAssigning(true);
    setError("");
    try {
      await assignCourseToInstructor(selectedInstructor._id, selectedCourseId);

      // Increment local course count and update state
      setInstructors((prev) =>
        prev.map((ins) => {
          if (ins._id === selectedInstructor._id) {
            return {
              ...ins,
              courseCount: (ins.courseCount || 0) + 1,
            };
          }
          return ins;
        })
      );

      // Reset modal state
      setSelectedInstructor(null);
      setSelectedCourseId("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign course");
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active": return "admin-statusBadge--approved";
      case "blocked": return "admin-statusBadge--rejected";
      case "left": return "admin-statusBadge--rejected";
      default: return "admin-statusBadge--approved";
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
        header: "Name",
        cell: (info) => <strong>{info.getValue() || "—"}</strong>,
      }),
      columnHelper.accessor("emailAddress", {
        header: "Email",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor("courseCount", {
        header: "Courses Taught",
        cell: (info) => {
          const count = info.getValue();
          return <span style={{ fontWeight: "600" }}>{count !== undefined ? count : 0}</span>;
        },
      }),
      columnHelper.accessor("status", {
        header: "Availability",
        cell: (info) => {
          const currentStatus = info.getValue() || "active";
          const displayLabel = currentStatus === "active" ? "Present" : currentStatus === "left" ? "Left" : "Blocked";
          return (
            <span className={`admin-statusBadge ${getStatusBadgeClass(currentStatus)}`}>
              {displayLabel}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "statusAction",
        header: "Change Status",
        cell: ({ row }) => {
          const instructor = row.original;
          return (
            <select
              value={instructor.status || "active"}
              disabled={updatingId === instructor._id}
              onChange={(e) => handleStatusChange(instructor._id, e.target.value)}
              className="admin-statusSelect"
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: "6px",
                border: "1px solid var(--bt-border)",
                cursor: "pointer",
                backgroundColor: updatingId === instructor._id ? "#f0f0f0" : "#fff"
              }}
            >
              <option value="active">Present (Active)</option>
              <option value="blocked">Blocked</option>
              <option value="left">Left Organization</option>
            </select>
          );
        },
      }),
      columnHelper.display({
        id: "assignCourse",
        header: "Assign Course",
        cell: ({ row }) => {
          const instructor = row.original;
          return (
            <button
              type="button"
              className="admin-btn--secondary"
              onClick={() => setSelectedInstructor(instructor)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              + Assign Course
            </button>
          );
        },
      }),
    ],
    [updatingId]
  );

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-pageLead">Loading instructors…</p>
      </div>
    );
  }

  return (
    <div className="admin-page instructors-page">
      <div>
        <h2 className="admin-pageTitle">Registered Instructors</h2>
        <p className="admin-pageLead">
          Search, sort, browse, and assign courses to instructors.
        </p>
      </div>

      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      <div className="admin-card">
        <DataTable
          data={instructors}
          columns={columns}
          searchPlaceholder="Search instructors…"
          emptyMessage="No instructors found."
        />
      </div>

      {/* MODAL FOR ASSIGNING COURSE */}
      {selectedInstructor && (
        <div className="admin-modalOverlay" style={modalOverlayStyle}>
          <div className="admin-modalCard" style={modalCardStyle}>
            <h3>Assign Course to {selectedInstructor.fullName}</h3>
            <p style={{ color: "var(--bt-muted)", fontSize: "0.9rem" }}>
              Select a course from the catalog to assign to this instructor.
            </p>

            <form onSubmit={handleAssignCourseSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
                style={{
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid var(--bt-border)",
                  fontSize: "0.95rem",
                }}
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title || course.courseName}
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedInstructor(null)}
                  disabled={assigning}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--bt-border)",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !selectedCourseId}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    background: "var(--bt-maroon)",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles for Modal backdrop
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalCardStyle = {
  background: "#fff",
  padding: "1.75rem",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "450px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
};

export default InstructorsList;