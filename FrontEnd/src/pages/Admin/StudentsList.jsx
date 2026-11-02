import { useEffect, useState } from "react";
// import { getStudents } from "../../service/userService.js";
import { api } from "../../service/axiosInstance.js"; 
import "./AdminShared.css";

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null); 

  // Search Filtering State
  const [searchTerm, setSearchFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limitPerPage] = useState(10); 
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
        
        const res = await api.get(`/user/students-list?page=${currentPage}&limit=${limitPerPage}`);
        const rows = res.data?.data ?? [];
        const paginationMeta = res.data?.pagination;
        
        setStudents(Array.isArray(rows) ? rows : []);
        if(paginationMeta){
          setTotalPages(paginationMeta.totalPages || 1)
          setTotalRecords(paginationMeta.totalRecords || 0)
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage,limitPerPage]); 

  // Status dropdown change handler
  const handleStatusChange = async (studentId, newStatus) => {
    setUpdatingId(studentId);
    setError("");
    try {
      await api.patch(`/user/user/status/${studentId}`, { status: newStatus });
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
      setTotalRecords((prev) => Math.max(0,prev - 1))
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
      <div className="admin-tableToolbar">
        <input
          type="text"
          placeholder="Search current page results..."
          value={searchTerm}
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        <span className="admin-tableCount">
         Showing {filteredStudents.length} of {totalRecords} Total Registered
      </span>
      </div>
      

      {/* 🌟 NATIVE HIGH-PERFORMANCE DATA TABLE GRID */}
    <div className="admin-tableShell">
      <div className="admin-tableScroll">
        <table className="admin-dataTable">
          <thead>
            <tr>
              <th><span className="admin-thBtn admin-thBtn--static">Name</span></th>
              <th><span className="admin-thBtn admin-thBtn--static">Email</span></th>
              <th><span className="admin-thBtn admin-thBtn--static">Phone</span></th>
              <th style={{textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Academic Level</span></th>
              <th style={{textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Status</span></th>
              <th style={{textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Access Config</span></th>
              <th style={{textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((stu) => (
                <tr key={stu._id}>
                  <td><strong>{stu.fullName || "—"}</strong></td>
                  <td>{stu.emailAddress || "—"}</td>
                  <td>{stu.phone || "—"}</td>
                  <td style={{textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", background: "#f1f3f5", padding: "4px 8px", borderRadius: "4px", fontWeight: "500" }}>
                      {stu.academicBackground || "General"}
                    </span>
                  </td>
                  <td style={{textAlign: "center" }}>
                    <span className={`admin-statusBadge ${getStatusBadgeClass(stu.status || "active")}`}>
                      {stu.status === "blocked" ? "Suspended" : stu.status === "finished" ? "Finished" : "Active"}
                    </span>
                  </td>
                  <td style={{textAlign: "center" }}>
                    <select
                     className="admin-filterSelect"
                      value={stu.status || "active"}
                      disabled={updatingId === stu._id}
                      onChange={(e) => handleStatusChange(stu._id, e.target.value)}
                      style={{ padding: "0 8px", borderRadius: "8px",height:"34px" }}
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Suspend Access</option>
                      <option value="finished">Finished Course</option>
                    </select>
                  </td>
                  <td className="admin-rowActions" style={{textAlign: "center" }}>
                    <div style={{justifyContent: "center" }}>
                      <button
                        type="button"
                        className="admin-approveBtn"
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
                        className="admin-dangerBtn"
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
                <td colSpan={7} className="tableEmpty">
                  No student records found on this page matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    
            {/* 🌟 DYNAMIC PAGINATION BUTTON BAR DESIGN INTERFACE */}
        <div className="admin-tablePagination">
          <span>Page <strong>{currentPage}</strong> of {totalPages}</span>
          <div style={{ display: "flex", gap: "0.35rem" }}>
            <button 
              type="button"
              className="admin-pageBtn"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <button
              type="button" 
              className="admin-pageBtn"
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 🛡️ MODAL OVERLAY UPDATE PROFILE WINDOW */}
      {editingStudent && (
        <div style={modalStyles.overlay}>
          <div className="admin-card" style={modalStyles.card}>
            <h3>Update Student Profile: {editingStudent.fullName}</h3>
            
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.88rem" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.88rem", fontWeight: "600" }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.88rem", fontWeight: "600" }}>
                  Academic Background
                </label>
                <select
                  value={editForm.academicBackground || "High School"}
                  onChange={(e) => setEditForm({ ...editForm, academicBackground: e.target.value })}
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff" }}
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

// Clean style layout properties for global layout uniformity
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
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
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
  }
};

export default StudentsList;
;
