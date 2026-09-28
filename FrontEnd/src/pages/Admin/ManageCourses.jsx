import { useEffect, useState } from "react";
import { api } from "../../service/axiosInstance";
import "./AdminShared.css";
import "./ManageCourses.css";

const emptyForm = {
  title: "",         
  code: "",          
  price: "",         
  description: "",
  duration: "",      
  instructorId: "",   
  batchNumber: "",
  programType: "Online",
};

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null); 
  const [isEditing, setIsEditing] = useState(null); 
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Search Filtering State
  const [searchTerm, setSearchFilter] = useState("");

  // Load courses & instructors using safe IIFE patterns to avoid cascading renders
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [courseRes, instructorRes] = await Promise.all([
          api.get("/course/view").catch(() => ({ data: [] })),
          api.get("/users/instructors-list").catch(() => ({ data: [] }))
        ]);

        const courseRows = courseRes.data?.data ?? courseRes.data ?? [];
        const instructorRows = instructorRes.data?.data ?? instructorRes.data ?? [];

        setCourses(Array.isArray(courseRows) ? courseRows : []);
        setInstructors(Array.isArray(instructorRows) ? instructorRows : []);
      } catch (err) {
        setError("Failed to initialize course catalog data channels.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Populate form with course data for editing
  const handleEdit = (course) => {
    setIsEditing(course._id);
    setFormData({
      title: course.title || course.courseName || "",
      code: course.code || course.courseCode || "",
      price: course.price || course.coursePrice || "",
      description: course.description || "",
      duration: course.duration || course.courseDuration || "",
      instructorId: course.instructorId?._id || course.instructorId || "",
      batchNumber: course.batchNumber || "",
      programType: course.programType || "Online",
    });
    setImageFile(null);
    setMessage("");
    setError("");
  };

  // Unified submit handler with inline database re-fetch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const dataPayload = new FormData();
      
      // Dual-compatible text mappings for cross-platform matching
      dataPayload.append("title", formData.title);
      dataPayload.append("courseName", formData.title); 
      dataPayload.append("code", formData.code);
      dataPayload.append("courseCode", formData.code); 
      dataPayload.append("price", formData.price);
      dataPayload.append("coursePrice", formData.price); 
      dataPayload.append("description", formData.description);
      dataPayload.append("duration", formData.duration);
      dataPayload.append("courseDuration", formData.duration); 
      dataPayload.append("batchNumber", formData.batchNumber);
      dataPayload.append("programType", formData.programType);
      
      if (formData.instructorId) {
        dataPayload.append("instructorId", formData.instructorId);
      }
      
      dataPayload.append("status", "active");
      dataPayload.append("isPublished", "true");
      dataPayload.append("isDeleted", "false");

      // 🌟 UNTOUCHED & RESTORED: Your exact original binary extraction logic rule
      if (imageFile) {
        const fileToUpload = imageFile instanceof FileList ? imageFile[0] : imageFile;
        dataPayload.append("image", fileToUpload);
      }

      const multiPartHeader = {
        headers: { "Content-Type": "multipart/form-data" }
      };

      if (isEditing) {
        const res = await api.put(`/course/update/${isEditing}`, dataPayload, multiPartHeader);
        setMessage(res.data?.message || "Course updated successfully!");
        setIsEditing(null);
      } else {
        if (!imageFile) {
          setError("Please select a thumbnail image file.");
          return;
        }
        const res = await api.post("/course/create", dataPayload, multiPartHeader);
        setMessage(res.data?.message || "Course created successfully!");
      }

      // Pull a 100% fresh data snapshot directly from MongoDB Atlas inline
      const coursesRes = await api.get("/course/view");
      const rows = coursesRes.data?.data ?? coursesRes.data ?? [];
      setCourses(Array.isArray(rows) ? rows : []);

      setFormData(emptyForm);
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course properties.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this course?")) return;
    try {
      await api.delete(`/course/delete/${id}`);
      setCourses((prev) => prev.filter((course) => course._id !== id));
      setMessage("Course deleted.");
    } catch (err) {
      setError("Failed to delete course.");
      console.log(err);
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData(emptyForm);
    setImageFile(null);
  };

  // Filter lists rows based on search input dynamically
  const filteredCourses = courses.filter((c) => {
    const searchString = searchTerm.toLowerCase();
    const titleText = (c.courseName || c.title || "").toLowerCase();
    const codeText = (c.courseCode || c.code || "").toLowerCase();
    return titleText.includes(searchString) || codeText.includes(searchString);
  });

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-pageLead">Synchronizing master catalog registers...</p>
      </div>
    );
  }

  return (
    <div className="admin-page manage-courses-page">
      <div>
        <h2 className="admin-pageTitle">Manage Academy Courses</h2>
        <p className="admin-pageLead">Create syllabus tracks, attach instructor access paths, and keep your public catalog up to date live.</p>
      </div>

      {message && <p className="admin-msg admin-msg--success">{message}</p>}
      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      {/* Editor/Creator Card Control Form Panel (Permanently Visible) */}
      <div className="admin-card" style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem" }}>
        <h3>{isEditing ? "✏️ Modify Selected Course Data" : "➕ Add a New Program Track"}</h3>
        <form onSubmit={handleSubmit} className="admin-formGrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "1rem" }}>
          <input type="text" name="title" placeholder="Course Name" value={formData.title} onChange={handleChange} required style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)" }} />
          <input type="text" name="code" placeholder="Course Code (e.g. FSWD-101)" value={formData.code} onChange={handleChange} required style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)" }} />
          <input type="number" name="price" placeholder="Course Tuition Price (ETB)" value={formData.price} onChange={handleChange} required style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)" }} />
          <input type="text" name="duration" placeholder="Course Duration (e.g. 12 Weeks)" value={formData.duration} onChange={handleChange} required style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)" }} />
          <input type="text" name="batchNumber" placeholder="Batch Number (e.g. B-2026-FS)" value={formData.batchNumber} onChange={handleChange} required style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)", gridColumn: "1 / -1" }} />
          
          <input type="text" name="description" placeholder="Short course overview description..." value={formData.description} onChange={handleChange} required style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)", gridColumn: "1 / -1" }} />
          
          <select name="instructorId" value={formData.instructorId} onChange={handleChange} style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)", background: "#fff" }}>
            <option value="">Select Assignee Instructor (Optional)</option>
            {instructors.map((inst) => (
              <option key={inst._id} value={inst._id}>
                {inst.fullName || inst.name}
              </option>
            ))}
          </select>

          <select name="programType" value={formData.programType} onChange={handleChange} required style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bt-border)", background: "#fff" }}>
            <option value="Online">Online Classroom</option>
            <option value="In-Person">In-Person Campus</option>
            <option value="Hybrid">Hybrid Delivery</option>
          </select>

          <div className="file-input-wrapper" style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
            <label style={{ fontWeight: "600", fontSize: "0.85rem" }}>Course Cover Thumbnail Image File:</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files)} required={!isEditing} />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" className="admin-submit-btn" style={{ background: "var(--bt-maroon)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
              {isEditing ? "Save Configuration Changes" : "Publish Course Module"}
            </button>
            {isEditing && (
              <button type="button" onClick={cancelEdit} className="admin-cancel-btn" style={{ background: "#6c757d", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Modern Search Filter Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search course tracks by name or module code..."
          value={searchTerm}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ padding: "0.65rem 1rem", width: "100%", maxWidth: "360px", borderRadius: "8px", border: "1px solid rgba(120,13,49,0.12)", fontSize: "0.9rem" }}
        />
      </div>

      {/* Native HTML Data Table Grid Structure */}
      <div className="admin-card" style={{ padding: "1.5rem", overflowX: "auto", background: "#fff", borderRadius: "12px" }}>
        <table className="student-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(120,13,49,0.12)", background: "#fbfbfc" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Course Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Code</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Duration</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Delivery Type</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Batch Code</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Price Tuition</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Management Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course._id || course.code} style={{ borderBottom: "1px solid rgba(120,13,49,0.12)" }}>
                  <td style={{ padding: "12px" }}><strong>{course.courseName || course.title || "—"}</strong></td>
                  <td style={{ padding: "12px" }}><code>{course.courseCode || course.code || "—"}</code></td>
                  <td style={{ padding: "12px" }}>{course.courseDuration || course.duration || "—"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.85rem", background: "#f1f3f5", padding: "4px 8px", borderRadius: "4px", fontWeight: "500" }}>
                      {course.programType || "Online"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>{course.batchNumber || "—"}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "var(--bt-maroon)" }}>
                    ETB {(course.coursePrice || course.price || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button
                        type="button"
                        style={{ background: "#007bff", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" }}
                        onClick={() => handleEdit(course)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        style={{ background: "#dc3545", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" }}
                        onClick={() => handleDelete(course._id)}
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
                  No academy courses matched your current filter criteria parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageCourses;
