import { useEffect, useMemo, useState } from "react";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { api } from "../../service/axiosInstance";
import DataTable from "../../components/admin/DataTable";
import "./AdminShared.css";
import "./ManageCourses.css";

const columnHelper = legacyCreateColumnHelper();

const emptyForm = {
  courseName: "",
  courseCode: "",
  coursePrice: "", 
  description: "",
  courseDuration: "", 
  instructorId: "",   
  batchNumber: "",
  programType: "Online",
};

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(null); // TRACKER: stores course ID if editing, otherwise null
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/course/view");
        const rows = res.data?.data ?? res.data ?? [];
        setCourses(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError("Failed to load courses");
        console.log(err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await api.get("/users/instructors-list");
        const rows = res.data?.data ?? res.data ?? [];
        setInstructors(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.log("Failed to load instructors", err);
      }
    };
    fetchInstructors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Populates the form fields with the selected course data
  const handleEdit = (course) => {
    setIsEditing(course._id);
    setFormData({
      courseName: course.courseName || "",
      courseCode: course.courseCode || "",
      coursePrice: course.coursePrice || "",
      description: course.description || "",
      courseDuration: course.courseDuration || "",
      instructorId: course.instructorId?._id || course.instructorId || "",
      batchNumber: course.batchNumber || "",
      programType: course.programType || "Online",
    });
    setMessage("");
    setError("");
  };

  // 2. Handles both Create and Update depending on isEditing state
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const submissionData = { ...formData };
      if (!submissionData.instructorId) {
        submissionData.instructorId = null; 
      }

      if (isEditing) {
        // UPDATE MODE
        const res = await api.put(`/course/update/${isEditing}`, submissionData);
        setMessage(res.data?.message || "Course updated successfully!");
        
        // Update item in local list state immediately
        const updatedCourse = res.data?.data ?? res.data ?? submissionData;
        setCourses((prev) =>
          prev.map((c) => (c._id === isEditing ? { ...c, ...updatedCourse } : c))
        );
        
        // Clear editing context states
        setIsEditing(null);
        setFormData(emptyForm);
      } else {
        // CREATE MODE
        const res = await api.post("/course/create", submissionData);
        setMessage(res.data?.message || "Course created successfully!");
        setFormData(emptyForm);
        const created = res.data?.data ?? res.data;
        if (created) {
          setCourses((prev) => [created, ...prev]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/course/${id}`);
      setCourses((prev) => prev.filter((course) => course._id !== id));
      setMessage("Course deleted.");
      if (isEditing === id) {
        setIsEditing(null);
        setFormData(emptyForm);
      }
    } catch {
      setError("Failed to delete course");
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData(emptyForm);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("courseName", {
        header: "Name",
        cell: (info) => <strong>{info.getValue()}</strong>,
      }),
      columnHelper.accessor("courseCode", {
        header: "Code",
      }),
      columnHelper.accessor("courseDuration", {
        header: "Course Duration",
      }),
      columnHelper.accessor("programType", {
        header: "Type",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor("batchNumber", {
        header: "Batch",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="admin-edit-btn"
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid var(--bt-border)",
                cursor: "pointer",
                background: "#faf7f8"
              }}
              onClick={() => handleEdit(row.original)}
            >
              Edit
            </button>
            <button
              type="button"
              className="admin-dangerBtn"
              onClick={() => handleDelete(row.original._id)}
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    [courses, isEditing] // Dependencies added to ensure up-to-date data triggers rendering
  );

  return (
    <div className="admin-page manage-courses-page">
      <div>
        <h2 className="admin-pageTitle">Manage Courses</h2>
        <p className="admin-pageLead">
          Create programs and keep your catalog up to date.
        </p>
      </div>

      {message && <p className="admin-msg admin-msg--success">{message}</p>}
      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      <div className="admin-card">
        {/* Title text changes dynamically depending on context state */}
        <h3>{isEditing ? "Modify course data" : "Add a course"}</h3>
        <form onSubmit={handleSubmit} className="admin-formGrid">
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={formData.courseName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="courseCode"
            placeholder="Course Code"
            value={formData.courseCode}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="coursePrice"
            placeholder="Course Price"
            value={formData.coursePrice}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="courseDuration"
            placeholder="Course Duration"
            value={formData.courseDuration}
            onChange={handleChange}
            required
          />
          
          <select
            name="instructorId" 
            value={formData.instructorId}
            onChange={handleChange}
          >
            <option value="">Select Instructor (Optional)</option>
            {instructors.map((inst) => (
              <option key={inst._id} value={inst._id}>
                {inst.fullName || inst.name} 
              </option>
            ))}
          </select>
          
          <input
            type="text"
            name="batchNumber"
            placeholder="Batch Number"
            value={formData.batchNumber}
            onChange={handleChange}
            required
          />
          <select
            name="programType"
            value={formData.programType}
            onChange={handleChange}
          >
            <option value="Online">Online</option>
            <option value="In-person">In-person</option>
            <option value="Both">Both</option>
          </select>
          
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", marginTop: "0.5rem" }}>
            <button type="submit" className="admin-primaryBtn">
              {isEditing ? "Save Changes" : "Add Course"}
            </button>
            {isEditing && (
              <button type="button" className="admin-ghostBtn" onClick={cancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h3>Existing courses</h3>
        <DataTable
          data={courses}
          columns={columns}
          searchPlaceholder="Search courses…"
          emptyMessage="No courses yet."
        />
      </div>
    </div>
  );
}

export default ManageCourses;
