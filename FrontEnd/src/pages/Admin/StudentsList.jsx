import { useEffect, useState } from "react";
import { getStudents } from "../../service/userService.js";
import { api } from "../../service/axiosInstance.js"; 
import "./AdminShared.css";

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null); 

  // Search Filtering State
  const [searchTerm, setSearchFilter] = useState("");

  // States for Editing Student Profiles
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", academicBackground: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  // Sync data on component mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        
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

  // Status dropdown change handler
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

  // Profile update handler
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

  // Student permanent account deletion handler
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

  // Filter list rows based on search input metrics dynamically
  const filteredStudents = students.filter((stu) => {
    const searchString = searchTerm.toLowerCase();
    return (
      stu.fullName?.toLowerCase().includes(searchString) ||
      stu.emailAddress?.toLowerCase().includes(searchString) ||
      stu.phone?.includes(searchString)
    );
  });

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-pageLead">Launching active workspace data links...</p>
      </div>
    );
  }

   return (
    <div className="admin-page students-page">
      <div>
        <h2 className="admin-pageTitle">Registered Students</h2>
        <p className="admin-pageLead">Manage your student registry profiles, credentials, and access permissions live.</p>
      </div>

      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      {/* Modern Search Filter bar Element */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search students by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ padding: "0.65rem 1rem", width: "100%", maxWidth: "360px", borderRadius: "8px", border: "1px solid rgba(120,13,49,0.12)", fontSize: "0.9rem" }}
        />
      </div>

      {/* 🌟 NATIVE HIGH-PERFORMANCE DATA TABLE GRID */}
      <div className="admin-card" style={{ padding: "1.5rem", overflowX: "auto", background: "#fff", borderRadius: "12px" }}>
        <table className="student-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(120,13,49,0.12)", background: "#fbfbfc" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Academic Level</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Portal Access Config</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Management Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((stu) => (
                <tr key={stu._id} style={{ borderBottom: "1px solid rgba(120,13,49,0.12)" }}>
                  <td style={{ padding: "12px" }}><strong>{stu.fullName || "—"}</strong></td>
                  <td style={{ padding: "12px" }}>{stu.emailAddress || "—"}</td>
                  <td style={{ padding: "12px" }}>{stu.phone || "—"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", background: "#f1f3f5", padding: "4px 8px", borderRadius: "4px", fontWeight: "500" }}>
                      {stu.academicBackground || "General"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span className={`admin-statusBadge ${getStatusBadgeClass(stu.status || "active")}`}>
                      {stu.status === "blocked" ? "Suspended" : stu.status === "finished" ? "Finished" : "Active"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <select
                      value={stu.status || "active"}
                      disabled={updatingId === stu._id}
                      onChange={(e) => handleStatusChange(stu._id, e.target.value)}
                      style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid rgba(120,13,49,0.12)", cursor: "pointer" }}
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Suspend Access</option>
                      <option value="finished">Finished Course</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button
                        type="button"
                        style={{ background: "#007bff", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" }}
                        onClick={() => {
                          setEditingStudent(stu);
                          setEditForm({ 
                            fullName: stu.fullName || "", 
                            phone: stu.phone || "",
                            academicBackground: stu.academicBackground || ""
                          });
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        style={{ background: "#dc3545", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" }}
                        onClick={() => handleDeleteStudent(stu._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--bt-muted)" }}>
                  No student records matched your current filter criteria parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL OVERLAY UPDATE PROFILE WINDOW */}
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

const modalOverlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000,
};

const modalStyles = {
  overlay: modalOverlayStyle,
  card: {
    background: "#fff",
    padding: "1.75rem",
    borderRadius: "16px",
    width: "100%", maxWidth: "450px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
  }
};

export default StudentsList;
