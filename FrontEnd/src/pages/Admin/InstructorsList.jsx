import { useEffect, useState } from "react";
// import { getInstructors } from "../../service/userService.js";
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
  // Pagination Tracking State Management
  const[currentPage,setCurrentPage] =useState(1);
  const[totalPages,setTotalPages]=useState(1);
  const[totalRecords,setTotalRecords]=useState(0);
  const[limitPerPage] =useState(10);

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
        setError("")

        const [instRes, courseRes] = await Promise.all([
          api.get(`/user/instructors-list?page=${currentPage}&limit=${limitPerPage}`),
          getCourses().catch(() => ({ data: [] })),
        ]);

        const instructorRows = instRes.data?.data ?? instRes.data ?? [];
        const courseRows = courseRes.data?.data ?? courseRes.data ?? [];
        const paginationMeta = instRes.data?.pagination;

        setInstructors(Array.isArray(instructorRows) ? instructorRows : []);
        setCourses(Array.isArray(courseRows) ? courseRows : []);
        
        if(paginationMeta){
          setTotalPages(paginationMeta.totalPages || 1);
          setTotalRecords(paginationMeta.totalRecords || 0);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load instructor records.");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentPage,limitPerPage]);

  // 1. Status dropdown change handler
  const handleStatusChange = async (instructorId, newStatus) => {

    setUpdatingId(instructorId);
    setError("");
    try {
      await api.patch(`/user/instructor/status/${instructorId}`, { status: newStatus });
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
      alert("Course successfully assigned to instructor!")
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

  if (loading && instructors.length === 0) {
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
      <div className="admin-tableToolbar">
        <input
          type="text"
          placeholder="Search current page results..."
          value={searchTerm}
          onChange={(e) => setSearchFilter(e.target.value)}
           className="admin-tableSearch"
        />
        <span className="admin-tableCount">
          Showing {filteredInstructors.length} of {totalRecords}
        </span>
      </div>
      {/* COMPLIANT NATIVE ADMIN SHARED DATA TABLE GRID */}
      <div className="admin-tableShell">
        <div className="admin-tableScroll">
          <table className="admin-dataTable">
            <thead>
              <tr>
                <th><span className="admin-thBtn admin-thBtn--static">Name</span></th>
                <th><span className="admin-thBtn admin-thBtn--static">Email</span></th>
                <th><span className="admin-thBtn admin-thBtn--static">Phone</span></th>
                <th style={{ textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Active Courses</span></th>
                <th style={{ textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Status</span></th>
                <th style={{ textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Availability Config</span></th>
                <th style={{ textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Assignments</span></th>
                <th style={{ textAlign: "center" }}><span className="admin-thBtn admin-thBtn--static">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((ins) => (
                  <tr key={ins._id}>
                    <td><strong>{ins.fullName || "—"}</strong></td>
                    <td>{ins.emailAddress || "—"}</td>
                    <td>{ins.phone || "—"}</td>
                    <td style={{ textAlign: "center", fontWeight: "600" }}>{ins.courseCount || 0}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`admin-statusBadge ${ins.status === "blocked" || ins.status === "left" ? "admin-statusBadge--rejected" : "admin-statusBadge--approved"}`}>
                        {ins.status === "active" || !ins.status ? "Present" : ins.status === "left" ? "Left" : "Blocked"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <select
                        className="admin-filterSelect"
                        value={ins.status || "active"}
                        disabled={updatingId === ins._id}
                        onChange={(e) => handleStatusChange(ins._id, e.target.value)}
                        style={{ height: "34px", padding: "0 8px", borderRadius: "8px" }}
                      >
                        <option value="active">Present (Active)</option>
                        <option value="blocked">Suspend Access</option>
                        <option value="left">Terminated / Left</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="admin-approveBtn"
                        style={{ background: "#f3e8ff", color: "#6b21a8", border: "1px solid #e9d5ff" }}
                        onClick={() => setSelectedInstructor(ins)}
                      >
                        Assign Course
                      </button>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="admin-rowActions" style={{ justifyContent: "center" }}>
                        <button
                          type="button"
                          className="admin-approveBtn"
                          onClick={() => {
                            setEditingInstructor(ins);
                            setEditForm({ fullName: ins.fullName || "", phone: ins.phone || "" });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-dangerBtn"
                          onClick={() => handleDeleteInstructor(ins._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-tableEmpty">
                    No instructor records found on this page matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* DYNAMIC PAGINATION BUTTON BAR DESIGN INTERFACE */}
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

      {/* MODAL 1: ASSIGN COURSE PROGRAM */}
      {selectedInstructor && (
        <div style={modalStyles.overlay}>
          <div className="admin-card" style={modalStyles.card}>
            <h3>Assign Course to {selectedInstructor.fullName}</h3>
            <form onSubmit={handleAssignCourseSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.88rem" }}>Select Academic Program</label>
                <select
                  required
                  className="admin-filterSelect"
                  style={{ width: "100%", height: "40px" }}
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title || course.courseName || "Untitled Program"}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-dangerBtn"
                  style={{ height: "42px", borderRadius: "999px", padding: "0 1.5rem" }}
                  onClick={() => { setSelectedInstructor(null); setSelectedCourseId(""); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="admin-primaryBtn"
                  style={{ height: "42px", padding: "0 1.5rem", background: "#6b21a8" }}
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PROFILE EDITOR */}
      {editingInstructor && (
        <div style={modalStyles.overlay}>
          <div className="admin-card" style={modalStyles.card}>
            <h3>Update Instructor Profile</h3>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.88rem" }}>Full Name</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px", border: "1px solid #ccc" }}
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600", fontSize: "0.88rem" }}>Phone Number</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "8px", border: "1px solid #ccc" }}
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-dangerBtn"
                  style={{ height: "42px", borderRadius: "999px", padding: "0 1.5rem" }}
                  onClick={() => setEditingInstructor(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="admin-primaryBtn"
                  style={{ height: "42px", padding: "0 1.5rem" }}
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

// Layout styling configuration variables for component modaling
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

export default InstructorsList;









