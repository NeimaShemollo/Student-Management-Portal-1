import { useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { api } from "../../service/axiosInstance";
import DataTable from "../../components/admin/DataTable";
import "./AdminShared.css";
import "./ManageCourses.css";

const columnHelper = createColumnHelper();

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

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/course/view");
        const rows = res.data?.data ?? res.data ?? [];
        setCourses(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError("Failed to load courses");
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  // Load instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await api.get("/users/instructors-list");
        const rows = res.data?.data ?? res.data ?? [];
        setInstructors(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error("Failed to load instructors", err);
      }
    };
    fetchInstructors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Populate form with course data
  const handleEdit = (course) => {
    setIsEditing(course._id);
    setFormData({
      title: course.courseName || "",
      code: course.courseCode || "",
      price: course.coursePrice || "",
      description: course.description || "",
      duration: course.courseDuration || "",
      instructorId: course.instructorId?._id || course.instructorId || "",
      batchNumber: course.batchNumber || "",
      programType: course.programType || "Online",
    });
    setImageFile(null);
    setMessage("");
    setError("");
  };

  // Submit layout handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const dataPayload = new FormData();
      
      // 1. Text entries appended first
      Object.keys(formData).forEach((key) => {
        if (key === "instructorId" && !formData[key]) {
          return;
        }
        dataPayload.append(key, formData[key]);
      });

      // 2. Binary file appended after fields
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
        
        const updatedCourse = res.data?.data ?? res.data;
        setCourses((prev) =>
          prev.map((c) => (c._id === isEditing ? { ...c, ...updatedCourse } : c))
        );
        
        setIsEditing(null);
        setFormData(emptyForm);
        setImageFile(null);
      } else {
        if (!imageFile) {
          setError("Please select a thumbnail image file.");
          return;
        }

        const res = await api.post("/course/create", dataPayload, multiPartHeader);
        setMessage(res.data?.message || "Course created successfully!");
        setFormData(emptyForm);
        setImageFile(null);
        
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
      await api.delete(`/course/delete/${id}`);
      setCourses((prev) => prev.filter((course) => course._id !== id));
      setMessage("Course deleted.");
    } catch (err) {
      setError("Failed to delete course");
      console.log(err)
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData(emptyForm);
    setImageFile(null);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("courseName", {
        header: "Name",
        cell: (info) => <strong>{info.getValue()}</strong>,
      }),
      columnHelper.accessor("courseCode", { header: "Code" }),
      columnHelper.accessor("courseDuration", { header: "Course Duration" }),
      columnHelper.accessor("programType", { header: "Type" }),
      columnHelper.accessor("batchNumber", { header: "Batch" }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="admin-edit-btn" onClick={() => handleEdit(row.original)}>Edit</button>
            <button type="button" className="admin-dangerBtn" onClick={() => handleDelete(row.original._id)}>Delete</button>
          </div>
        ),
      }),
    ],
    [courses, isEditing]
  );

  return (
    <div className="admin-page manage-courses-page">
      <div>
        <h2 className="admin-pageTitle">Manage Courses</h2>
        <p className="admin-pageLead">Create programs and keep your catalog up to date.</p>
      </div>

      {message && <p className="admin-msg admin-msg--success">{message}</p>}
      {error && <p className="admin-msg admin-msg--error">{error}</p>}

      <div className="admin-card">
        <h3>{isEditing ? "Modify course data" : "Add a course"}</h3>
        <form onSubmit={handleSubmit} className="admin-formGrid">
          <input type="text" name="title" placeholder="Course Name" value={formData.title} onChange={handleChange} required />
          <input type="text" name="code" placeholder="Course Code" value={formData.code} onChange={handleChange} required />
          <input type="number" name="price" placeholder="Course Price" value={formData.price} onChange={handleChange} required />
          <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
          <input type="text" name="duration" placeholder="Course Duration" value={formData.duration} onChange={handleChange} required />
          
          <select name="instructorId" value={formData.instructorId} onChange={handleChange}>
            <option value="">Select Instructor (Optional)</option>
            {instructors.map((inst) => (
              <option key={inst._id} value={inst._id}>
                {inst.fullName || inst.name}
              </option>
            ))}
          </select>
          
          <input type="text" name="batchNumber" placeholder="Batch Number" value={formData.batchNumber} onChange={handleChange} required />

          <select name="programType" value={formData.programType} onChange={handleChange} required>
            <option value="Online">Online</option>
            <option value="In-Person">In-Person</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <div className="file-input-wrapper">
            <label style={{ fontWeight: "600" }}>Course Thumbnail Image:</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!isEditing} />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" className="admin-submit-btn">{isEditing ? "Save Changes" : "Create Course"}</button>
            {isEditing && <button type="button" onClick={cancelEdit} className="admin-cancel-btn">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="admin-card" style={{ marginTop: "20px" }}>
        <h3>Active Catalog List</h3>
        <DataTable columns={columns} data={courses} />
      </div>
    </div>
  );
}

export default ManageCourses;



  
