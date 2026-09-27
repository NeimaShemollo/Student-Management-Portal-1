import { useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table"; // 🌟 FIXED: Lowercase 'createColumnHelper'
import { getStudents } from "../../service/userService.js";
import { api } from "../../service/axiosInstance.js"; 
import DataTable from "../../components/admin/DataTable.jsx";
import "./AdminShared.css";

const columnHelper = createColumnHelper(); // 🌟 FIXED: Matches corrected lowercase import mapping

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null); 

  // States for Editing Student Profiles
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", academicBackground: "" });
  const [savingEdit, setSavingEdit] = useState(false);

    
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        
        // Execute your api request
        const res = await getStudents();
        const rows = res.data?.data ?? res.data ?? [];
        
        setStudents(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    })();
  }, []); 


  // 🌟 FIXED: Changed API endpoint string path from '/users/status/' to '/user/status/'
  const handleStatusChange = async (studentId, newStatus) => {
    setUpdatingId(studentId);
    setError("");
    try {
      await api.patch(`/user/status/${studentId}`, { status: newStatus });
      
      setStudents((prev) =>
        prev.map((student) =>
          student._id === studentId ? { ...student, status: newStatus } : student
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student status");
    } finally {
      setUpdatingId(null);
    }
  };

  // 🌟 ADDED: Handle updating student fields submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSavingEdit(true);
    setError("");
    try {
      await api.put(`/user/update/${editingStudent._id}`, editForm);
      setStudents((prev) =>
        prev.map((stu) =>
          stu._id === editingStudent._id ? { ...stu, ...editForm } : stu
        )
      );
      setEditingStudent(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student details.");
    } finally {
      setSavingEdit(false);
    }
  };

  // 🌟 ADDED: Secure delete request pipeline
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to permanently delete this student account?")) return;
    setError("");
    try {
      await api.delete(`/user/delete/${studentId}`);
      setStudents((prev) => prev.filter((stu) => stu._id !== studentId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student record.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active": return "admin-statusBadge--approved"; 
      case "blocked": return "admin-statusBadge--rejected"; 
      case "finished": return "admin-statusBadge--pending";  
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
      columnHelper.accessor("academicBackground", {
        header: "Academic Level",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const currentStatus = info.getValue() || "active";
          return (
            <span className={`admin-statusBadge ${getStatusBadgeClass(currentStatus)}`} style={{ textTransform: "capitalize" }}>
              {currentStatus === "active" ? "Active" : currentStatus === "blocked" ? "Suspended" : "Finished"}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        id: "statusAction",
        header: "Change Status",
        cell: (info) => {
          const student = info.row.original;
          return (
            <select
              value={info.getValue() || "active"}
              disabled={updatingId === student._id}
              onChange={(e) => handleStatusChange(student._id, e.target.value)}
              className="admin-statusSelect"
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: "6px",
                border: "1px solid var(--bt-border)",
                cursor: "pointer",
                backgroundColor: updatingId === student._id ? "#f0f0f0" : "#fff"
              }}
            >
              <option value="active">Active</option>
              <option value="blocked">Suspend Access</option>
              <option value="finished">Finished Course</option>
            </select>
          );
        },
      }),
      // 🌟 ADDED: Dedicated Management Action Operations Column
      columnHelper.accessor("_id", {
        id: "managementActions",
        header: "Actions",
        cell: (info) => {
          const student = info.row.original;
          return (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                type="button"
                style={{ background: "#007bff", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
                onClick={() => {
                  setEditingStudent(student);
                  setEditForm({ 
                    fullName: student.fullName || "", 
                    phone: student.phone || "",
                    academicBackground: student.academicBackground || ""
                  });
                }}
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                style={{ background: "#dc3545", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
                onClick={() => handleDeleteStudent(student._id)}
              >
                🗑️ Delete
              </button>
            </div>
          );
        }
      })
    ],
    [updatingId] 
  );

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-pageLead">Loading students…</p>
      </div>
    );
  }

    return (
    <div className="admin-page students-page">
      <div>
        <h2 className="admin-pageTitle">Registered Students</h2>
        <p className="admin-pageLead">
          Search, sort, update profiles, and manage active student platform clearance.
        </p>
      </div>

      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      <div className="admin-card">
        <DataTable
          data={students}
          columns={columns}
          searchPlaceholder="Search students…"
          emptyMessage="No students found."
        />
      </div>

      {/* 🌟 FIXED: Corrected conditional syntax wrapper block for the Student Update Form Modal */}
      {editingStudent && (
        <div className="admin-modalOverlay" style={modalStyles.overlay}>
          <div className="admin-modalCard" style={modalStyles.card}>
            <h3>Update Profile: {editingStudent.fullName}</h3>
            
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Academic Background</label>
                {/* 🌟 FIXED: Safely closed the dropdown element tag structure here */}
                <select
                  value={editForm.academicBackground}
                  onChange={(e) => setEditForm({ ...editForm, academicBackground: e.target.value })}
                  required
                  style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)", background: "#fff" }}
                >
                  <option value="High School">High School Graduate</option>
                  <option value="Diploma">Diploma Level</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="PhD">PhD Level</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                {/* 🌟 FIXED: Added spaces to element attributes and closed button blocks correctly */}
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  disabled={savingEdit}
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--bt-border)", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", background: "var(--bt-maroon)", color: "#fff", fontWeight: "600", cursor: "pointer" }}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles for Modal Backdrops
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

const modalStyles = {
  overlay: modalOverlayStyle,
  card: {
    background: "#fff",
    padding: "1.75rem",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  }
};

export default StudentsList;

   