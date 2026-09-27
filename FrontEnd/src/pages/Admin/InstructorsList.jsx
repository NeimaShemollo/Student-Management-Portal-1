
import { useEffect, useState } from "react";
import { getInstructors } from "../../service/userService.js";
import { getCourses, assignCourseToInstructor } from "../../service/courseService.js";
import { api } from "../../service/axiosInstance.js";
import "./AdminShared.css";

function InstructorsList() {
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search Filtering State
  const [searchTerm, setSearchFilter] = useState("");

  // Control Actions Loading Flags
  const [updatingId, setUpdatingId] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Modals Management States
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    (async () => {
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
        setError(err.response?.data?.message || err.message || "Failed to load instructor records.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 1. Status dropdown change handler
  const handleStatusChange = async (instructorId, newStatus) => {
    setUpdatingId(instructorId);
    setError("");
    try {
      await api.patch(`/user/status/${instructorId}`, { status: newStatus });
      setInstructors((prev) =>
        prev.map((ins) => (ins._id === instructorId ? { ...ins, status: newStatus } : ins))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update instructor availability status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. Profile update handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingInstructor) return;
    setSavingEdit(true);
    setError("");
    try {
      await api.put(`/user/update/${editingInstructor._id}`, editForm);
      setInstructors((prev) =>
        prev.map((ins) => (ins._id === editingInstructor._id ? { ...ins, ...editForm } : ins))
      );
      setEditingInstructor(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to modify profile records.");
    } finally {
      setSavingEdit(false);
    }
  };

  // 3. Instructor delete handler
  const handleDeleteInstructor = async (instructorId) => {
    if (!window.confirm("Are you sure you want to permanently delete this instructor account?")) return;
    setError("");
    try {
      await api.delete(`/user/delete/${instructorId}`);
      setInstructors((prev) => prev.filter((ins) => ins._id !== instructorId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to drop instructor registry row.");
    }
  };

  // 4. Course Assignment handler
  const handleAssignCourseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstructor || !selectedCourseId) return;
    setAssigning(true);
    setError("");
    try {
      await assignCourseToInstructor(selectedInstructor._id, selectedCourseId);
      setInstructors((prev) =>
        prev.map((ins) =>
          ins._id === selectedInstructor._id ? { ...ins, courseCount: (ins.courseCount || 0) + 1 } : ins
        )
      );
      setSelectedInstructor(null);
      setSelectedCourseId("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign course program module.");
    } finally {
      setAssigning(false);
    }
  };

  // Filter list rows based on search input metrics dynamically
  const filteredInstructors = instructors.filter((ins) => {
    const searchString = searchTerm.toLowerCase();
    return (
      ins.fullName?.toLowerCase().includes(searchString) ||
      ins.emailAddress?.toLowerCase().includes(searchString) ||
      ins.phone?.includes(searchString)
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
    <div className="admin-page instructors-page">
      <div>
        <h2 className="admin-pageTitle">Registered Instructors</h2>
        <p className="admin-pageLead">Manage your teaching staff accounts, profile parameters, and availability statuses live.</p>
      </div>

      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      {/* Modern Search Filter bar Element */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search instructors by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ padding: "0.65rem 1rem", width: "100%", maxWidth: "360px", borderRadius: "8px", border: "1px solid rgba(120,13,49,0.12)", fontSize: "0.9rem" }}
        />
      </div>

      {/* 🌟 FIXED: Native HTML layout removes the undefined '<DataTable>' element crash completely! */}
      <div className="admin-card" style={{ padding: "1.5rem", overflowX: "auto", background: "#fff", borderRadius: "12px" }}>
        <table className="student-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(120,13,49,0.12)", background: "#fbfbfc" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Courses</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Availability Config</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Program Assignment</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Management Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstructors.length > 0 ? (
              filteredInstructors.map((ins) => (
                <tr key={ins._id} style={{ borderBottom: "1px solid rgba(120,13,49,0.12)" }}>
                  <td style={{ padding: "12px" }}><strong>{ins.fullName || "—"}</strong></td>
                  <td style={{ padding: "12px" }}>{ins.emailAddress || "—"}</td>
                  <td style={{ padding: "12px" }}>{ins.phone || "—"}</td>
                  <td style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>{ins.courseCount || 0}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span className={`admin-statusBadge admin-statusBadge--${ins.status === "blocked" || ins.status === "left" ? "rejected" : "approved"}`}>
                      {ins.status === "active" || !ins.status ? "Present" : ins.status === "left" ? "Left" : "Blocked"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <select
                      value={ins.status || "active"}
                      disabled={updatingId === ins._id}
                      onChange={(e) => handleStatusChange(ins._id, e.target.value)}
                      style={{ padding: "0.4rem", borderRadius: "6px", border: "1px solid rgba(120,13,49,0.12)", cursor: "pointer" }}
                    >
                      <option value="active">Present (Active)</option>
                      <option value="blocked">Blocked</option>
                      <option value="left">Left Organization</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button type="button" className="admin-btn--secondary" onClick={() => setSelectedInstructor(ins)} style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                      + Assign Course
                    </button>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button
                        type="button"
                        style={{ background: "#007bff", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" }}
                        onClick={() => {
                          setEditingInstructor(ins);
                          setEditForm({ fullName: ins.fullName || "", phone: ins.phone || "" });
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        style={{ background: "#dc3545", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" }}
                        onClick={() => handleDeleteInstructor(ins._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan ={8} style={{textAlign:"center",padding: "2rem", color: "var(--bt-muted)" }}>
                  No instructors matched your filters.
                  </td>
                  </tr>
)}
</tbody>
</table>
</div>

      {/* MODAL: COURSE ASSIGNMENT */}
      {selectedInstructor && (
        <div className="admin-modalOverlay" style={modalStyles.overlay}>
          <div className="admin-modalCard" style={modalStyles.card}>
            <h3>Assign Course to {selectedInstructor.fullName}</h3>
            
            <form onSubmit={handleAssignCourseSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <select 
                value={selectedCourseId} 
                onChange={(e) => setSelectedCourseId(e.target.value)} 
                required 
                style={{ padding: "0.6rem", borderRadius: "8px", border: "1px solid rgba(120,13,49,0.12)" }}
              >
                <option value="">-- Select a Course --</option>
                {/* 🌟 FIXED: Added explicit <option> tags and proper implicit return parentheses */}
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseName || c.title}
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                {/* 🌟 FIXED: Added missing closing button tag */}
                <button 
                  type="button" 
                  onClick={() => setSelectedInstructor(null)} 
                  disabled={assigning} 
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid rgba(120,13,49,0.12)", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={assigning || !selectedCourseId} 
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "none", background: "var(--bt-maroon)", color: "#fff", fontWeight: "600", cursor: "pointer" }}
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROFILE UPDATE */}
      {editingInstructor && (
        <div className="admin-modalOverlay" style={modalStyles.overlay}>
          <div className="admin-modalCard" style={modalStyles.card}>
            <h3>Update Profile: {editingInstructor.fullName}</h3>
            
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.fullName} 
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} 
                  style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid rgba(120,13,49,0.12)" }} 
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Phone Number</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                  style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid rgba(120,13,49,0.12)" }} 
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                {/* 🌟 FIXED: Added missing closing button tag */}
                <button 
                  type="button" 
                  onClick={() => setEditingInstructor(null)} 
                  disabled={savingEdit} 
                  style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid rgba(120,13,49,0.12)", background: "#fff", cursor: "pointer" }}
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

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  card: { background: "#fff", padding: "1.75rem", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }
};

export default InstructorsList;













